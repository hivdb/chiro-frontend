import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByRefName,
  filterByAbNames,
  filterByInfectedVarName,
  queryIsoAggkeys
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


function usePrepareQuery({
  refName,
  abNames,
  infectedVarName,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {$joinSep: LIST_JOIN_MAGIC_SEP};
      const where = [];

      filterSpike({where});
      filterByRefName({refName, where, params});
      filterByAbNames({abNames, where, params});
      filterByInfectedVarName({infectedVarName, where, params});

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ${queryIsoAggkeys()},
          (M.gene || ':' || M.position) AS gene_pos,
          COUNT(DISTINCT M.ref_name || '::' || M.rx_name) AS count
        FROM invitro_selection_results M
        LEFT JOIN rx_conv_plasma RXCP ON
          RXCP.ref_name = M.ref_name AND
          RXCP.rx_name = M.rx_name
        LEFT JOIN variants INFVAR ON
          RXCP.infected_var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY iso_aggkeys, gene_pos
      `;
      return {
        sql,
        params
      };
    },
    [abNames, infectedVarName, refName, skip]
  );
}

export default function useSummaryByVirus() {
  const {
    params: {
      refName,
      infectedVarName,
      abNames
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({
    abNames,
    refName,
    infectedVarName,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const splitted = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        row => {
          row.varNames = [];
          row.isoAggkeys = (
            row.isoAggkeys ? row.isoAggkeys.split(LIST_JOIN_MAGIC_SEP) : []
          );
          return row;
        }
      );
    },
    [isPending, payload, skip]
  );

  return [splitted, skip || isPending];
}
