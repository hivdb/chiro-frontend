import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterByVarName,
  filterByIsoAggkey,
  filterByGenePos,
  filterBySbjRxAbNames,
  filterBySbjRxInfectedVarName
} from '../sql-fragments/selection-mutations';


function usePrepareQuery({
  abNames,
  varName,
  infectedVarName,
  isoAggkey,
  genePos,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {};
      const where = [];

      filterByVarName({varName, where, params});
      filterByIsoAggkey({isoAggkey, where, params});
      filterByGenePos({genePos, where, params});
      filterBySbjRxAbNames({abNames, where, params});
      filterBySbjRxInfectedVarName({infectedVarName, where, params});

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          COUNT(*)
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
    [abNames, varName, genePos, infectedVarName, isoAggkey, skip]
  );
}


export default function useSummaryByArticle() {
  const {
    params: {
      varName,
      isoAggkey,
      genePos,
      abNames,
      infectedVarName
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
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
