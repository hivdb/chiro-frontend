import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByRefName,
  filterByIsoAggkey,
  filterByGenePos,
  queryAbNames,
  queryInfectedVarName
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


function usePrepareQuery({refName, varName, isoAggkey, genePos, skip}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {$joinSep: LIST_JOIN_MAGIC_SEP};
      const where = [];

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByRefName({refName, where, params});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ${queryAbNames()},
          ${queryInfectedVarName()},
          COUNT(*) AS count
        FROM invitro_selection_results M
          LEFT JOIN rx_conv_plasma RXCP ON
            RXCP.ref_name = M.ref_name AND
            RXCP.rx_name = M.rx_name
          LEFT JOIN variants INFVAR ON
            RXCP.infected_var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY ab_names, INFVAR.as_wildtype, INFVAR.var_name
      `;
      return {
        sql,
        params
      };
    },
    [genePos, varName, isoAggkey, refName, skip]
  );
}

export default function useSummaryByRx() {
  const {
    params: {
      refName,
      varName,
      isoAggkey,
      genePos
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({refName, varName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const abSplitted = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        one => {
          one.abNames = (
            one.abNames ? one.abNames.split(LIST_JOIN_MAGIC_SEP) : []
          );
          return one;
        }
      );
    },
    [isPending, payload, skip]
  );

  return [abSplitted, skip || isPending];
}
