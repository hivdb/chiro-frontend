import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByRefName,
  filterBySbjRxAbNames,
  filterBySbjRxInfectedVarName,
  filterByNaiveRx,
  queryIsoAggkeys
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


function usePrepareQuery({
  refName,
  abNames,
  infectedVarName,
  naive,
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
      filterBySbjRxAbNames({abNames, where, params});
      filterBySbjRxInfectedVarName({infectedVarName, where, params});
      filterByNaiveRx({naive, where, params});

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ${queryIsoAggkeys()},
          (M.gene || ':' || M.position) AS gene_pos,
          COUNT(DISTINCT M.ref_name || '::' || M.subject_name) AS count
        FROM invivo_selection_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY iso_aggkeys, gene_pos
      `;
      return {
        sql,
        params
      };
    },
    [abNames, infectedVarName, refName, naive, skip]
  );
}

export default function useSummaryByVirus() {
  const {
    params: {
      refName,
      infectedVarName,
      abNames,
      naive
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
    naive,
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
