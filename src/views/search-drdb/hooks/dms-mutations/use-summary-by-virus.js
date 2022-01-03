import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterByRefName,
  filterByAbNames,
  queryIsoAggkeys
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


function usePrepareQuery({
  refName,
  abNames,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {$joinSep: LIST_JOIN_MAGIC_SEP};
      const where = [];

      filterByRefName({refName, where, params});
      filterByAbNames({abNames, where, params});

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ${queryIsoAggkeys()},
          (M.gene || ':' || M.position) AS gene_pos,
          COUNT(*) AS count
        FROM dms_escape_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY iso_aggkeys, gene_pos
      `;
      return {
        sql,
        params
      };
    },
    [abNames, refName, skip]
  );
}

export default function useSummaryByVirus() {
  const {
    params: {
      refName,
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
