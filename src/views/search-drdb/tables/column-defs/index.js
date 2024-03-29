import React from 'react';

import {
  useCompareSuscResultsByAntibodies
} from '../../hooks';

import Articles from '../../hooks/articles';
import Antibodies from '../../hooks/antibodies';
import Isolates from '../../hooks/isolates';
import IsolateAggs from '../../hooks/isolate-aggs';
import Variants from '../../hooks/variants';

import useFold from './fold';
import usePotency from './potency';
import {
  useInfectedVarName,
  useControlVarName
} from './variant';
import useIsoAggkey from './isolate-agg';
import useVarNameOrIsoAggkey from './variant-or-isolate-agg';
import useRefName from './reference';
import useCumulativeCount from './cumulative-count';
import useDataAvailability from './data-availability';
import useTreatments, {useTreatment} from './treatments';
import useMutations, {useMutation} from './mutations';
import useSmallColumns from './small-columns';


export default function useColumnDefs({
  columns,
  labels
}) {
  const {
    articleLookup,
    isPending: isRefLookupPending
  } = Articles.useMe();
  const {
    antibodyLookup,
    isPending: isAbLookupPending
  } = Antibodies.useAll();
  const {
    isolateLookup,
    isPending: isIsoLookupPending
  } = Isolates.useMe();
  const {
    isolateAggLookup,
    isPending: isIsoAggLookupPending
  } = IsolateAggs.useMe();
  const {
    variantLookup,
    isPending: isVarLookupPending
  } = Variants.useMe();

  const compareByAntibodies = (
    useCompareSuscResultsByAntibodies(antibodyLookup)
  );

  const skip = (
    isRefLookupPending ||
    isAbLookupPending ||
    isIsoLookupPending ||
    isIsoAggLookupPending ||
    isVarLookupPending
  );

  const commonArgs = {
    articleLookup,
    antibodyLookup,
    isolateLookup,
    isolateAggLookup,
    variantLookup,
    compareByAntibodies,
    labels,
    columns,
    skip
  };

  const refName = useRefName(commonArgs);
  const controlVarName = useControlVarName(commonArgs);
  const infectedVarName = useInfectedVarName(commonArgs);
  const isoAggkey = useIsoAggkey(commonArgs);
  const varNameOrIsoAggkey = useVarNameOrIsoAggkey(commonArgs);
  const cumulativeCount = useCumulativeCount(commonArgs);
  const potency = usePotency(commonArgs);
  const fold = useFold(commonArgs);
  const dataAvailability = useDataAvailability(commonArgs);
  const treatments = useTreatments(commonArgs);
  const treatment = useTreatment(commonArgs);
  const mutation = useMutation(commonArgs);
  const mutations = useMutations(commonArgs);
  const emergingMutations = useMutations({
    colName: 'emergingMutations',
    ...commonArgs,
    distinguishBaseline: true
  });

  const waningMutations = useMutations({
    colName: 'waningMutations',
    ...commonArgs
  });
  const smallColumns = useSmallColumns(commonArgs);

  return React.useMemo(
    () => {
      if (skip) {
        return [];
      }
      const lookup = {
        refName,
        controlVarName,
        infectedVarName,
        isoAggkey,
        varNameOrIsoAggkey,
        cumulativeCount,
        potency,
        fold,
        dataAvailability,
        treatments,
        treatment,
        mutation,
        mutations,
        emergingMutations,
        waningMutations,
        ...smallColumns
      };

      return columns.map(
        name => lookup[name]
      ).filter(cd => cd);
    },
    [
      columns,
      controlVarName,
      cumulativeCount,
      dataAvailability,
      fold,
      infectedVarName,
      isoAggkey,
      varNameOrIsoAggkey,
      potency,
      refName,
      treatments,
      treatment,
      mutation,
      mutations,
      emergingMutations,
      waningMutations,
      smallColumns,
      skip
    ]
  );
}
