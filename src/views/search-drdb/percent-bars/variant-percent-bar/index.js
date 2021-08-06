import React from 'react';
import PropTypes from 'prop-types';

import {
  useVariantNumExpLookup, 
  useIsolateAggNumExpLookup,
  useIsolateNumExpLookup
} from '../../hooks';

import PercentBar from '../../../../components/percent-bar';

import prepareItems from './prepare-items';
import VariantItem from './item';


VariantPercentBar.propTypes = {
  loaded: PropTypes.bool.isRequired,
  variants: PropTypes.array,
  isolateAggs: PropTypes.array,
  isolates: PropTypes.array
};


export default function VariantPercentBar({
  loaded,
  variants,
  isolateAggs,
  isolates
}) {
  const [varLookup, isVarPending] = useVariantNumExpLookup({
    skip: !loaded
  });

  const [isoAggLookup, isIsoAggPending] = useIsolateAggNumExpLookup({
    skip: !loaded
  });

  const [isoLookup, isIsoPending] = useIsolateNumExpLookup({
    skip: !loaded
  });

  const isPending = !loaded || isVarPending || isIsoAggPending || isIsoPending;

  const presentVariants = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      else {
        return prepareItems({
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
      isPending,
      variants,
      isolateAggs,
      isolates,
      varLookup,
      isoAggLookup,
      isoLookup
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
             index
           }} />
        )
      )}
    </PercentBar>
  </>;
}
