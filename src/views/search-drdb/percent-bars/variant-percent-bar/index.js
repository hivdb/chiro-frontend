import React from 'react';

import {
  useVariantNumExpLookup, 
  useIsolateAggNumExpLookup,
  useIsolateNumExpLookup
} from '../../hooks';

import Variants from '../../hooks/variants';
import Isolates from '../../hooks/isolates';
import IsolateAggs from '../../hooks/isolate-aggs';
import LocationParams from '../../hooks/location-params';

import PercentBar from '../../../../components/percent-bar';

import VariantRxItem from '../item';

import prepareItems from './prepare-items';
import VariantDesc from './desc';


export default function VariantPercentBar() {

  const {
    params: {
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();

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
        let filteredVarLookup = varLookup;
        let filteredIsoAggLookup = isoAggLookup;

        if (varName && varName !== 'any') {
          filteredVarLookup = {};
          filteredVarLookup[varName] = varLookup[varName];
          filteredIsoAggLookup = {};
        }
        else if (isoAggkey && isoAggkey !== 'any') {
          filteredIsoAggLookup = {};
          filteredIsoAggLookup[isoAggkey] = isoAggLookup[isoAggkey];
          filteredVarLookup = {};
        }

        return prepareItems({
          variants,
          isolateAggs,
          isolates,
          varLookup: filteredVarLookup,
          isoAggLookup: filteredIsoAggLookup,
          isoLookup
        });
      }
    },
    [
      varName,
      isoAggkey,
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
          <VariantRxItem
           key={item.name}
           styleType="variant"
           descComponent={VariantDesc}
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
