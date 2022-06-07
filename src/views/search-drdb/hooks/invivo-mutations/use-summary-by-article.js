import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByIsoAggkey,
  filterByGenePos,
  filterBySbjRxAbNames,
  filterBySbjRxInfectedVarName,
  filterByNaiveRx
} from '../sql-fragments/selection-mutations';


function usePrepareQuery({
  abNames,
  infectedVarName,
  varName,
  isoAggkey,
  genePos,
  naive,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {};
      const where = [];

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterBySbjRxAbNames({abNames, where, params});
        filterBySbjRxInfectedVarName({infectedVarName, where, params});
        filterByNaiveRx({naive, where, params});
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          COUNT(DISTINCT subject_name)
        FROM invivo_selection_results M
        LEFT JOIN variants INFVAR ON
          M.infected_var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY M.ref_name
      `;
      return {
        sql,
        params
      };
    },
    [abNames, varName, genePos, infectedVarName, isoAggkey, naive, skip]
  );
}


export default function useSummaryByArticle() {
  const {
    params: {
      varName,
      isoAggkey,
      genePos,
      abNames,
      infectedVarName,
      naive
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({
    abNames,
    varName,
    isoAggkey,
    infectedVarName,
    genePos,
    naive,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
