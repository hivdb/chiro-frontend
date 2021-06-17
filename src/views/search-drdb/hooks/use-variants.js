import React from 'react';
import useQuery from './use-query';

const LIST_JOIN_UNIQ = "$#\b#$";


export default function useVariants({
  skip = false
} = {}) {

  const sql = `
    SELECT
      var_name,
      (
        SELECT GROUP_CONCAT(synonym, "${LIST_JOIN_UNIQ}")
        FROM variant_synonyms VS
        WHERE V.var_name=VS.var_name
        ORDER BY LENGTH(synonym)
      ) AS synonyms,
      count AS susc_result_count
    FROM variant_stats V
    WHERE stat_group='susc_results'
    ORDER BY count DESC
  `;

  const {
    payload,
    isPending
  } = useQuery({sql, skip});

  return React.useMemo(
    () => {
      let variants;
      if (payload) {
        variants = payload.map(
          ({varName, synonyms, suscResultCount}) => ({
            varName,
            synonyms: synonyms ? synonyms.split(LIST_JOIN_UNIQ) : [],
            suscResultCount
          })
        );
      }

      return {
        variants,
        isPending
      };
    },
    [payload, isPending]
  );
}
