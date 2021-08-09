import React from 'react';

import {groupSmallSlices} from '../funcs';

import SubItemIsolate from './subitem-isolate';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_ISO,
  TYPE_OTHER
} from '../types';


export default function prepareItems({
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
    .reduce((acc, isoProps) => {
      const {
        isoName,
        varName
      } = isoProps;
      acc[varName] = acc[varName] || [];
      const display = <SubItemIsolate {...isoProps} />;

      acc[varName].push({
        name: isoName,
        type: TYPE_ISO,
        display,
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
        subItems: namedIsoLookup[varName] || [],
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
