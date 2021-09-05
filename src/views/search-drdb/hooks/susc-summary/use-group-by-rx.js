import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


const GROUP_BY_OPTIONS = [
  'infected_variant',
  'vaccine',
  'antibody',
  'vaccine_dosage',
  'timing',
  'subject_species'
];


export default function useGroupByRx(groupBys) {
  const {
    params: {
      refName,
      varName,
      isoAggkey,
      genePos
    }
  } = LocationParams.useMe();
  const aggregateBy = React.useMemo(
    () => {
      const aggregateBy = groupBys.filter(
        key => GROUP_BY_OPTIONS.includes(key)
      );
      if (refName) {
        aggregateBy.push('article');
      }
      if (varName) {
        aggregateBy.push('variant');
      }
      if (isoAggkey) {
        aggregateBy.push('isolate_agg');
      }
      if (genePos) {
        aggregateBy.push('position');
      }
      return aggregateBy;
    },
    [genePos, groupBys, isoAggkey, refName, varName]
  );

  const [
    suscSummary,
    isPending
  ] = useSuscSummary({
    aggregateBy,
    refName,
    varName,
    isoAggkey,
    genePos
  });
  if (isPending) {
    return [null, true];
  }
  else {
    return [suscSummary, false];
  }
}
