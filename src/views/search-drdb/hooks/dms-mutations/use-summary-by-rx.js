import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
  filterByRefName,
  filterByIsoAggkey,
  filterByGenePos,
  queryAbNames
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
          COUNT(*) AS count
        FROM dms_escape_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY ab_names
      `;
      return {
        sql,
        params
      };
    },
    [varName, genePos, isoAggkey, refName, skip]
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
