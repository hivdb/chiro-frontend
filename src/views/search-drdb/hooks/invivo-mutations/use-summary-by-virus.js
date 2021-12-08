import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

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
      const realAbNames = abNames.filter(n => n !== 'any');

      if (refName) {
        where.push(`
          M.ref_name = $refName
        `);
        params.$refName = refName;
      }
      if (realAbNames && realAbNames.length > 0) {
        const excludeAbQuery = [];
        for (const [idx, abName] of realAbNames.entries()) {
          where.push(`
            EXISTS (
              SELECT 1 FROM
                subject_treatments SBJRX,
                rx_antibodies RXMAB
              WHERE
                SBJRX.subject_name = M.subject_name AND
                SBJRX.start_date < M.appearance_date AND
                SBJRX.ref_name = M.ref_name AND
                RXMAB.ref_name = M.ref_name AND
                SBJRX.rx_name = RXMAB.rx_name AND
                RXMAB.ab_name = $abName${idx}
            )
          `);
          params[`$abName${idx}`] = abName;
          excludeAbQuery.push(`$abName${idx}`);
        }
      }
      if (infectedVarName) {
        // TODO: infectedVarName should be CP infectedVarName
        where.push(`
          $infVarName = 'any' OR
          ($infVarName = 'Wild Type' AND INFVAR.as_wildtype IS TRUE) OR
          (INFVAR.var_name = $infVarName)
        `);
        params.$infVarName = infectedVarName;
      }
      else if (abNames.some(n => n === 'any')) {
        where.push(`
          EXISTS (
            SELECT 1 FROM
              subject_treatments SBJRX,
              rx_antibodies RXMAB
            WHERE
              SBJRX.subject_name = M.subject_name AND
              SBJRX.start_date < M.appearance_date AND
              SBJRX.ref_name = M.ref_name AND
              RXMAB.ref_name = M.ref_name AND
              SBJRX.rx_name = RXMAB.rx_name
          )
        `);
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          (
            SELECT GROUP_CONCAT(var_name, $joinSep) FROM (
              SELECT DISTINCT ISO.var_name
              FROM isolates ISO
              WHERE EXISTS (
                SELECT 1 FROM isolate_mutations ISOM WHERE
                  ISO.iso_name = ISOM.iso_name AND
                  ISOM.gene = M.gene AND (
                    ISOM.position = M.position OR (
                      M.amino_acid = 'del' AND
                      EXISTS (
                        SELECT 1 FROM known_deletion_ranges DR WHERE
                          M.gene = DR.gene AND
                          M.position BETWEEN
                            DR.position_start AND DR.position_end AND
                          ISOM.position BETWEEN
                            DR.position_start AND DR.position_end
                      )
                    )
                  ) AND
                  ISOM.amino_acid = M.amino_acid
              )
            ) tmp1
          ) AS var_names,
          (
            SELECT GROUP_CONCAT(iso_aggkey, $joinSep) FROM (
              SELECT DISTINCT ISOP.iso_aggkey
              FROM isolate_pairs ISOP
              WHERE EXISTS (
                SELECT 1 FROM isolate_mutations ISOM WHERE
                  ISOP.iso_name = ISOM.iso_name AND
                  ISOM.gene = M.gene AND (
                    ISOM.position = M.position OR (
                      M.amino_acid = 'del' AND
                      EXISTS (
                        SELECT 1 FROM known_deletion_ranges DR WHERE
                          M.gene = DR.gene AND
                          M.position BETWEEN
                            DR.position_start AND DR.position_end AND
                          ISOM.position BETWEEN
                            DR.position_start AND DR.position_end
                      )
                    )
                  ) AND
                  ISOM.amino_acid = M.amino_acid
              )
            ) tmp2
          ) AS iso_aggkeys,
          (M.gene || ':' || M.position) AS gene_pos,
          COUNT(*) AS count
        FROM invivo_selection_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY var_names, iso_aggkeys, gene_pos
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
          row.varNames = (
            row.varNames ? row.varNames.split(LIST_JOIN_MAGIC_SEP) : []
          );
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
