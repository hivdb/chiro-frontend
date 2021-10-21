import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {getMutations} from '../isolate-aggs';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';
const InVivoMutationsContext = React.createContext();


function usePrepareQuery({
  refName,
  abNames,
  infectedVarName,
  isoAggkey,
  genePos,
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
      if (isoAggkey) {
        const conds = [];
        for (const [
          idx,
          {gene, position: pos, aminoAcid: aa}
        ] of getMutations(isoAggkey).entries()) {
          conds.push(`(
            M.gene = $gene${idx} AND
            M.position = $pos${idx} AND
            M.amino_acid = $aa${idx}
          )`);
          params[`$gene${idx}`] = gene;
          params[`$pos${idx}`] = pos;
          params[`$aa${idx}`] = aa;
        }
        where.push(conds.join(' OR '));
      }
      else if (genePos) {
        const [gene, pos] = genePos.split(':');
        where.push(`M.gene = $gene AND M.position = $pos`);
        params.$gene = gene;
        params.$pos = Number.parseInt(pos);
      }
      let rxAbFiltered = false;
      if (realAbNames && realAbNames.length > 0) {
        rxAbFiltered = true;
        const excludeAbQuery = [];
        for (const [idx, abName] of realAbNames.entries()) {
          where.push(`
            EXISTS (
              SELECT 1 FROM
                subject_treatments SBJRX,
                rx_antibodies RXMAB
              WHERE
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
        where.push('M.infected_var_name = $infVarName');
        params.$infVarName = infectedVarName;
      }
      else if (!rxAbFiltered && abNames.some(n => n === 'any')) {
        where.push(`
          EXISTS (
            SELECT 1 FROM
              subject_treatments SBJRX,
              rx_antibodies RXMAB
            WHERE
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
          M.ref_name,
          M.subject_name,
          SBJ.subject_species,
          M.infected_var_name,
          M.gene,
          R.amino_acid as ref_amino_acid,
          M.position,
          M.amino_acid,
          MAX(
            1,
            ROUND((
              JULIANDAY(appearance_date) -
              JULIANDAY(infection_date)
            ) / 30.)
          ) timing,
          appearance_date,
          infection_date,
          M.count,
          M.total,
          M.severity
        FROM invivo_selection_results M
        JOIN ref_amino_acid R ON
          R.gene = M.gene AND
          R.position = M.position
        JOIN subjects SBJ ON
          M.ref_name = SBJ.ref_name AND
          M.subject_name = SBJ.subject_name
        WHERE
          (${where.join(') AND (')})
      `;
      const sbjRxSql = `
        SELECT
          ref_name,
          subject_name,
          rx_name,
          (
            SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
            FROM rx_antibodies RXMAB, antibodies MAB
            WHERE
              SRX.ref_name = RXMAB.ref_name AND
              SRX.rx_name = RXMAB.rx_name AND
              RXMAB.ab_name = MAB.ab_name
            ORDER BY MAB.priority, RXMAB.ab_name
          ) AS ab_names,
          CASE
            WHEN EXISTS (
              SELECT 1 FROM rx_conv_plasma RXCP
              WHERE
                RXCP.ref_name = SRX.ref_name AND
                RXCP.rx_name = SRX.rx_name
            ) THEN 'conv-plasma'
            WHEN EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
                RXMAB.ref_name = SRX.ref_name AND
                RXMAB.rx_name = SRX.rx_name
            ) THEN 'antibody'
            ELSE 'unclassified'
          END AS rx_type,
          start_date_cmp,
          start_date,
          end_date_cmp,
          end_date,
          dosage,
          dosage_unit
        FROM subject_treatments SRX
        WHERE EXISTS (
          SELECT 1 FROM invivo_selection_results M
          WHERE
            M.ref_name = SRX.ref_name AND
            M.subject_name = SRX.subject_name AND
            (${where.join(') AND (')})
        )
      `;
      return {
        sql,
        sbjRxSql,
        params
      };
    },
    [abNames, genePos, infectedVarName, isoAggkey, refName, skip]
  );
}

InVivoMutationsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function InVivoMutationsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine || filterFlag.infectedVariant;
  const {
    sql,
    sbjRxSql,
    params
  } = usePrepareQuery({abNames, refName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const {
    payload: sbjRxPayload,
    isPending: isSbjRxPending
  } = useQuery({sql: sbjRxSql, params, skip});

  const inVivoMuts = React.useMemo(
    () => {
      if (skip || isPending || isSbjRxPending) {
        return [];
      }
      const allSbjRx = sbjRxPayload
        .reduce(
          (acc, one) => {
            const key = `${one.refName}${
              LIST_JOIN_MAGIC_SEP
            }${one.subjectName}`;
            acc[key] = acc[key] || [];
            if (one.abNames) {
              one.abNames = one.abNames.split(LIST_JOIN_MAGIC_SEP);
            }
            acc[key].push(one);
            return acc;
          },
          {}
        );

      const ret = payload.map(
        mut => {
          const key = `${mut.refName}${LIST_JOIN_MAGIC_SEP}${mut.subjectName}`;
          const infectDate = new Date(mut.infectionDate);
          const treatments = (allSbjRx[key] || [])
            .filter(({startDate}) => startDate < mut.appearanceDate)
            .map(one => {
              const timing = Math.max(
                1,
                Math.round(
                  (new Date(one.startDate) - infectDate) / 86400000 / 30
                )
              );
              const endTiming = Math.max(
                1,
                Math.round(
                  (new Date(one.endDate) - infectDate) / 86400000 / 30
                )
              );
              return {
                ...one,
                timing,
                endTiming
              };
            })
            .sort(({timing: t1}, {timing: t2}) => t1 - t2);
          return {
            ...mut,
            count: mut.count || 1,
            total: mut.total || 1,
            treatments
          };
        }
      );
      return ret;
    },
    [isPending, isSbjRxPending, payload, sbjRxPayload, skip]
  );
  const contextValue = {
    inVivoMuts,
    isPending: skip || isPending || isSbjRxPending
  };

  return <InVivoMutationsContext.Provider value={contextValue}>
    {children}
  </InVivoMutationsContext.Provider>;
}

function useInVivoMutations() {
  return React.useContext(InVivoMutationsContext);
}

const InVivoMutations = {
  Provider: InVivoMutationsProvider,
  useMe: useInVivoMutations
};

export default InVivoMutations;
