import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import useSummaryByArticle from './use-summary-by-article';
import useSummaryByRx from './use-summary-by-rx';
import useSummaryByVirus from './use-summary-by-virus';

import {
  filterByRefName,
  filterByIsoAggkey,
  filterByGenePos,
  filterBySbjRxAbNames,
  filterBySbjRxInfectedVarName,
  queryInfectedVarName,
  queryAbNames,
  queryRxType
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';
const InVivoMutationsContext = React.createContext();


function usePrepareQuery({
  refName,
  abNames,
  infectedVarName,
  varName,
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

      if (varName) {
        where.push('false');
      }
      else {
        filterByRefName({refName, where, params});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterBySbjRxAbNames({abNames, where, params});
        filterBySbjRxInfectedVarName({infectedVarName, where, params});
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          M.subject_name,
          SBJ.subject_species,
          SBJ.immune_status,
          ${queryInfectedVarName()},
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
        LEFT JOIN variants INFVAR ON
          M.infected_var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
      `;
      const sbjRxSql = `
        SELECT
          SRX.ref_name,
          SRX.subject_name,
          SRX.rx_name,
          ${queryAbNames({mainTableName: 'SRX'})},
          ${queryRxType({mainTableName: 'SRX'})},
          ${queryInfectedVarName()},
          start_date_cmp,
          start_date,
          end_date_cmp,
          end_date,
          dosage,
          dosage_unit
        FROM subject_treatments SRX
        LEFT JOIN rx_conv_plasma RXCP ON
          RXCP.ref_name = SRX.ref_name AND
          RXCP.rx_name = SRX.rx_name
        LEFT JOIN isolates INFISO ON
          RXCP.infected_iso_name = INFISO.iso_name
        LEFT JOIN variants INFVAR ON
          INFISO.var_name = INFVAR.var_name
        WHERE EXISTS (
          SELECT 1 FROM invivo_selection_results M
          LEFT JOIN variants INFVAR ON
            M.infected_var_name = INFVAR.var_name
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
    [
      abNames,
      varName,
      genePos,
      infectedVarName,
      isoAggkey,
      refName,
      skip
    ]
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
      varName,
      infectedVarName,
      isoAggkey,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine;
  const {
    sql,
    sbjRxSql,
    params
  } = usePrepareQuery({
    refName,
    abNames,
    varName,
    infectedVarName,
    isoAggkey,
    genePos,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const {
    payload: sbjRxPayload,
    isPending: isSbjRxPending
  } = useQuery({sql: sbjRxSql, params, skip});

  const [inVivoSbjs, inVivoMuts] = React.useMemo(
    () => {
      if (skip || isPending || isSbjRxPending) {
        return [];
      }
      const allSbjRx = sbjRxPayload
        .reduce(
          (acc, {refName, subjectName, ...one}) => {
            const key = `${refName}${
              LIST_JOIN_MAGIC_SEP
            }${subjectName}`;
            acc[key] = acc[key] || [];
            if (one.abNames) {
              one.abNames = one.abNames.split(LIST_JOIN_MAGIC_SEP);
            }
            acc[key].push(one);
            return acc;
          },
          {}
        );

      const sbjs = Object.values(payload.reduce(
        (acc, {
          refName,
          subjectName,
          subjectSpecies,
          immuneStatus,
          infectedVarName,
          infectionDate,
          severity,
          ...mut
        }) => {

          const key = `${refName}${LIST_JOIN_MAGIC_SEP}${subjectName}`;
          if (!(key in acc)) {
            const infectDate = new Date(infectionDate);
            const treatments = (allSbjRx[key] || [])
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
            acc[key] = {
              refName,
              subjectName,
              subjectSpecies,
              immuneStatus,
              infectedVarName,
              infectionDate,
              severity,
              treatments,
              mutations: []
            };
          }
          acc[key].mutations.push(mut);
          return acc;
        },
        {}
      ));

      const muts = payload.map(
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
      return [sbjs, muts];
    },
    [isPending, isSbjRxPending, payload, sbjRxPayload, skip]
  );
  const contextValue = {
    inVivoSbjs,
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
  useMe: useInVivoMutations,
  useSummaryByArticle,
  useSummaryByRx,
  useSummaryByVirus
};

export default InVivoMutations;
