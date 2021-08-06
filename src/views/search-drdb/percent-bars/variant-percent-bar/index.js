import React from 'react';

import {
  useVariantNumExpLookup, 
  useIsolateAggNumExpLookup,
  useIsolateNumExpLookup
} from '../../hooks';

import Variants from '../../hooks/variants';
import Isolates from '../../hooks/isolates';
import IsolateAggs from '../../hooks/isolate-aggs';

import PercentBar from '../../../../components/percent-bar';

import prepareItems from './prepare-items';
import VariantItem from './item';


export default function VariantPercentBar() {
  const {
    variants,
    isPending: isVarListPending
  } = Variants.useMe();

  const {
    isolates,
    isPending: isIsoListPending
  } = Isolates.useMe();

  const {
    isolateAggs,
    isPending: isIsoAggListPending
  } = IsolateAggs.useMe();

  const [varLookup, isVarPending] = useVariantNumExpLookup();
  const [isoAggLookup, isIsoAggPending] = useIsolateAggNumExpLookup();
  const [isoLookup, isIsoPending] = useIsolateNumExpLookup();

  const isPending = (
    isVarListPending ||
    isIsoListPending ||
    isVarPending ||
    isIsoAggListPending ||
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
