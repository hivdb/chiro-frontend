import React from 'react';

import Variants from '../../hooks/variants';
import Isolates from '../../hooks/isolates';
import {NumExpStats} from '../../hooks/susc-summary';
import IsolateAggs from '../../hooks/isolate-aggs';
import LocationParams from '../../hooks/location-params';

import PercentBar from '../../../../components/percent-bar';

import VirusRxItem from '../item';

import prepareItems from './prepare-items';
import VirusDesc from './desc';


export default function VirusPercentBar() {

  const {
    params: {
      varName,
      isoAggkey,
      genePos
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

  const [varLookup, isVarPending] = NumExpStats.useVar();
  const [isoAggLookup, isIsoAggPending] = NumExpStats.useIsoAgg();
  const [isoLookup, isIsoPending] = NumExpStats.useIso();

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

        if (varName) {
          filteredVarLookup = {};
          filteredVarLookup[varName] = varLookup[varName];
          filteredIsoAggLookup = {};
        }
        else if (isoAggkey) {
          filteredIsoAggLookup = {};
          filteredIsoAggLookup[isoAggkey] = isoAggLookup[isoAggkey];
          filteredVarLookup = {};
        }
        else if (genePos) {
          filteredIsoAggLookup = {};
          for (const isoAggkey in isoAggLookup) {
            if (isoAggkey.slice(0, isoAggkey.length - 1) === genePos) {
              filteredIsoAggLookup[isoAggkey] = isoAggLookup[isoAggkey];
            }
          }
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
      genePos,
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
    <PercentBar scaleRatio={0.75}>
      {presentVariants.map(
        ({
          pcnt,
          item
        }, index) => (
          <VirusRxItem
           key={item.name}
           styleType="variant"
           descComponent={VirusDesc}
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
