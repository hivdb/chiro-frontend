import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByIsoAggkey,
  filterByGenePos,
  filterByAbNames,
  filterByInfectedVarName
} from '../sql-fragments/selection-mutations';


function usePrepareQuery({
  abNames,
  infectedVarName,
  varName,
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

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterByAbNames({abNames, where, params});
        filterByInfectedVarName({infectedVarName, where, params});
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          COUNT(DISTINCT M.rx_name) AS count
        FROM invitro_selection_results M
        LEFT JOIN rx_conv_plasma RXCP ON
          RXCP.ref_name = M.ref_name AND
          RXCP.rx_name = M.rx_name
        LEFT JOIN variants INFVAR ON
          RXCP.infected_var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY M.ref_name
      `;
      return {
        sql,
        params
      };
    },
    [abNames, infectedVarName, varName, genePos, isoAggkey, skip]
  );
}

export default function useSummaryByArticle() {
  const {
    params: {
      isoAggkey,
      infectedVarName,
      varName,
      genePos,
      abNames
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({
    abNames,
    isoAggkey,
    infectedVarName,
    varName,
    genePos,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
