import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {
  filterSpike,
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

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterByAbNames({abNames, where, params});
      }

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
      abNames,
      infectedVarName,
      vaccineName
    }
  } = LocationParams.useMe();
  const skip = !!infectedVarName || !!vaccineName;
  const {
    sql,
    params
  } = usePrepareQuery({abNames, varName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const finalPayload = React.useMemo(
    () => skip ? [] : payload,
    [skip, payload]
  );


  return [finalPayload, !skip && isPending];
}
