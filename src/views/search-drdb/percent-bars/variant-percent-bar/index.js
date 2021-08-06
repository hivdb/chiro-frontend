import React from 'react';
import PropTypes from 'prop-types';

import nestGet from 'lodash/get';
import nestSet from 'lodash/set';
import {
  useVariantNumExpLookup, 
  useIsolateAggNumExpLookup,
  useIsolateNumExpLookup
} from '../../hooks';
import shortenMutList from '../../shorten-mutlist';
import PercentBar from '../../../../components/percent-bar';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_ISO,
  TYPE_OTHER
} from './types';

import VariantItem from './item';


function groupSmallSlices(
  array, 
  sizeKey, 
  groupItem,
  maxNumItems
) {
  const items = [...array].reverse();
  const totalSize = items.reduce(
    (acc, item) => acc + nestGet(item, sizeKey),
    0
  );
  let remainItems = items.length;
  let groupItemSize = 0;
  const resultItems = [];
  const groupOrigItems = [];
  for (const item of items) {
    const size = nestGet(item, sizeKey);
    const pcnt = size / totalSize;
    if (remainItems >= maxNumItems) {
      groupItemSize += size;
      groupOrigItems.push(item);
    }
    else {
      resultItems.push({
        pcnt, item
      });
    }
    remainItems --;
  }
  resultItems.reverse();
  nestSet(groupItem, sizeKey, groupItemSize);
  if (groupItemSize > 0) {
    resultItems.push({
      pcnt: groupItemSize / totalSize,
      item: {
        ...groupItem,
        subItems: groupOrigItems.reverse()
      }
    });
  }
  return resultItems;
}


function prepareVariants({
  variants,
  isolateAggs,
  isolates,
  varLookup,
  isoAggLookup,
  isoLookup
}) {
  const namedIsoLookup = isolates
    .filter(({isoName, varName}) => (
      isoName in isoLookup &&
      varName !== null
    ))
    .reduce((acc, {isoName, varName, mutations}) => {
      acc[varName] = acc[varName] || [];
      acc[varName].push({
        name: isoName,
        type: TYPE_ISO,
        display: shortenMutList(mutations).join(' + '),
        displayExtra: null,
        numExp: isoLookup[isoName]
      });
      return acc;
    }, {});

  const presentVariants = [
    ...variants
      .filter(({varName}) => varName in varLookup)
      .map(({varName, synonyms}) => ({
        name: varName,
        type: TYPE_VARIANT,
        display: varName,
        displayExtra: synonyms.join('; '),
        subItems: namedIsoLookup[varName],
        numExp: varLookup[varName]
      })),
    ...isolateAggs
      .filter(({isoAggkey, varName}) => (
        isoAggkey in isoAggLookup &&
        varName === null
      ))
      .map(({isoAggkey, isoAggDisplay}) => ({
        name: isoAggkey,
        type: TYPE_ISOAGG,
        display: isoAggDisplay,
        displayExtra: null,
        numExp: isoAggLookup[isoAggkey]
      }))
  ];
  presentVariants.sort(
    (v1, v2) => {
      let cmp = v2.numExp - v1.numExp; // desc
      if (cmp === 0) {
        cmp = v1.type - v2.type; // asc
      }
      if (cmp === 0) {
        cmp = v1.name.localeCompare(v2.name);
      }
      return cmp;
    }
  );
  return groupSmallSlices(presentVariants, 'numExp', {
    name: 'Others',
    type: TYPE_OTHER,
    display: 'Others',
    displayExtra: null
  }, 6);
}


export default function VariantPercentBar({
  loaded,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText,
  variants,
  isolateAggs,
  isolates
}) {
  const [varLookup, isVarPending] = useVariantNumExpLookup({
    skip: !loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue
  });

  const [isoAggLookup, isIsoAggPending] = useIsolateAggNumExpLookup({
    skip: !loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue
  });

  const [isoLookup, isIsoPending] = useIsolateNumExpLookup({
    skip: !loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue
  });

  const presentVariants = React.useMemo(
    () => {
      if (!loaded || isVarPending || isIsoAggPending || isIsoPending) {
        return [];
      }
      else {
        return prepareVariants({
          variants,
          isolateAggs,
          isolates,
          varLookup,
          isoAggLookup,
          isoLookup
        });
      }
    },
    [
      loaded,
      variants,
      isolateAggs,
      isolates,
      varLookup,
      isVarPending,
      isoAggLookup,
      isIsoAggPending,
      isoLookup,
      isIsoPending
    ]
  );

  return <>
    <PercentBar>
      {presentVariants.map(
        ({
          pcnt,
          item
        }, index) => (
          <VariantItem
           key={item.name}
           {...{
             pcnt,
             item,
             index,
             variantValue,
             mutationText
           }} />
        )
      )}
    </PercentBar>
  </>;
}
  
VariantPercentBar.propTypes = {
  loaded: PropTypes.bool.isRequired,
  articleValue: PropTypes.string,
  antibodyValue: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  vaccineValue: PropTypes.string,
  convPlasmaValue: PropTypes.string,
  variantValue: PropTypes.string,
  mutationText: PropTypes.string,
  variants: PropTypes.array,
  isolateAggs: PropTypes.array,
  isolates: PropTypes.array
};
