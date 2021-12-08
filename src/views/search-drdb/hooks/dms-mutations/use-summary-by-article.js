import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterByVarName,
  filterByIsoAggkey,
  filterByGenePos,
  filterByAbNames
} from '../sql-fragments/selection-mutations';


function usePrepareQuery({abNames, varName, isoAggkey, genePos, skip}) {
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
      filterByAbNames({abNames, where, params});

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ref_name,
          COUNT(*) AS count
        FROM dms_escape_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY ref_name
      `;
      return {
        sql,
        params
      };
    },
    [abNames, varName, genePos, isoAggkey, skip]
  );
}

export default function useSummaryByArticle() {
  const {
    params: {
      varName,
      isoAggkey,
      genePos,
      abNames
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({abNames, varName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
