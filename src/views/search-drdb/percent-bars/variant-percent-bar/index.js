import React from 'react';
import PropTypes from 'prop-types';

import {
  useVariantNumExpLookup, 
  useIsolateAggNumExpLookup,
  useIsolateNumExpLookup
} from '../../hooks';

import Variants from '../../hooks/variants';
import Isolates from '../../hooks/isolates';

import PercentBar from '../../../../components/percent-bar';

import prepareItems from './prepare-items';
import VariantItem from './item';


VariantPercentBar.propTypes = {
  loaded: PropTypes.bool.isRequired,
  isolateAggs: PropTypes.array
};


export default function VariantPercentBar({
  loaded,
  isolateAggs
}) {
  const {
    variants,
    isPending: isVarListPending
  } = Variants.useMe();

  const {
    isolates,
    isPending: isIsoListPending
  } = Isolates.useMe();

  const [varLookup, isVarPending] = useVariantNumExpLookup({
    skip: !loaded
  });

  const [isoAggLookup, isIsoAggPending] = useIsolateAggNumExpLookup({
    skip: !loaded
  });

  const [isoLookup, isIsoPending] = useIsolateNumExpLookup({
    skip: !loaded
  });

  const isPending = (
    !loaded ||
    isVarListPending ||
    isIsoListPending ||
    isVarPending ||
    isIsoAggPending ||
    isIsoPending
  );

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
