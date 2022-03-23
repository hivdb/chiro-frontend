import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import useSummaryByArticle from './use-summary-by-article';
import useSummaryByRx from './use-summary-by-rx';
import useSummaryByVirus from './use-summary-by-virus';

import {
  filterSpike,
  filterByRefName,
  filterByIsoAggkey,
  filterByGenePos,
  filterBySbjRxAbNames,
  filterBySbjRxInfectedVarName,
  filterByNaiveRx,
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

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByRefName({refName, where, params});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterBySbjRxAbNames({abNames, where, params});
        filterBySbjRxInfectedVarName({infectedVarName, where, params});
        filterByNaiveRx({naive, where, params});
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
          SBJ.num_subjects,
          CAST(SUBSTR(infection_date, 1, 4) AS INTEGER) -
          SBJ.birth_year AS subject_age,
          ${queryInfectedVarName()},
          M.gene,
          R.amino_acid as ref_amino_acid,
          M.position,
          M.amino_acid,
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
        ORDER BY
          M.ref_name,
          M.subject_name,
          M.gene,
          M.position,
          M.amino_acid
      `;
      const sbjWaningMutSql = `
        SELECT
          SHX.ref_name,
          SHX.subject_name,
          SHX2.event_date AS isolate_date,
          ISOM.gene,
          R.amino_acid as ref_amino_acid,
          ISOM.position,
          ISOM.amino_acid,
          1 AS is_waning
        FROM subject_history SHX
        JOIN subject_history SHX2 ON
          SHX.ref_name = SHX2.ref_name AND
          SHX.subject_name = SHX2.subject_name
        JOIN isolate_mutations ISOM ON
          SHX.iso_name = ISOM.iso_name
        JOIN ref_amino_acid R ON
          R.gene = ISOM.gene AND
          R.position = ISOM.position
        WHERE
          SHX.event = 'infection' AND
          SHX2.event = 'isolation' AND
          SHX2.event_date > SHX.event_date AND
          ISOM.gene = 'S' AND
          NOT EXISTS (
            SELECT 1 FROM isolate_mutations ISOM2
            WHERE
              SHX2.iso_name = ISOM2.iso_name AND
              ISOM.gene = ISOM2.gene AND
              ISOM.position = ISOM2.position AND
              ISOM.amino_acid = ISOM2.amino_acid
          ) AND
          EXISTS (
            SELECT 1 FROM invivo_selection_results M
            LEFT JOIN variants INFVAR ON
              M.infected_var_name = INFVAR.var_name
            WHERE
              M.ref_name = SHX.ref_name AND
              M.subject_name = SHX.subject_name AND
              (${where.join(') AND (')})
          )
        ORDER BY
          SHX.ref_name,
          SHX.subject_name,
          SHX2.event_date,
          ISOM.gene,
          ISOM.position,
          ISOM.amino_acid
      `;
      const sbjIsoSql = `
        SELECT
          DISTINCT
          SHX.ref_name,
          SHX.subject_name,
          SHX.event_date AS isolate_date,
          ISOM.gene,
          R.amino_acid as ref_amino_acid,
          ISOM.position,
          ISOM.amino_acid,
          ISOM.count,
          ISOM.total,
          EXISTS (
            SELECT 1 FROM invivo_selection_results M
            WHERE
              M.ref_name = SHX.ref_name AND
              M.subject_name = SHX.subject_name AND
              M.gene = ISOM.gene AND
              M.position = ISOM.position AND
              M.amino_acid = ISOM.amino_acid
          ) AS isEmerging
        FROM subject_history SHX
        JOIN isolate_mutations ISOM ON
          SHX.iso_name = ISOM.iso_name
        JOIN ref_amino_acid R ON
          R.gene = ISOM.gene AND
          R.position = ISOM.position
        WHERE
          SHX.event IN ('infection', 'isolation') AND
          SHX.iso_name IS NOT NULL AND
          ISOM.gene = 'S' AND
          EXISTS (
            SELECT 1 FROM invivo_selection_results M
            LEFT JOIN variants INFVAR ON
              M.infected_var_name = INFVAR.var_name
            WHERE
              M.ref_name = SHX.ref_name AND
              M.subject_name = SHX.subject_name AND
              (${where.join(') AND (')})
          )
        ORDER BY
          SHX.ref_name,
          SHX.subject_name,
          isolate_date,
          ISOM.gene,
          ISOM.position,
          ISOM.amino_acid
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
        ORDER BY
          SRX.ref_name,
          SRX.subject_name,
          start_date,
          end_date
      `;
      return {
        sql,
        sbjIsoSql,
        sbjWaningMutSql,
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
      naive,
      skip
    ]
  );
}


function buildSbjRxLookup(sbjRxPayload) {
  return sbjRxPayload
    .reduce(
      (acc, {refName, subjectName, ...one}) => {
        const key = `${refName}${LIST_JOIN_MAGIC_SEP}${subjectName}`;
        acc[key] = acc[key] || [];
        if (one.abNames) {
          one.abNames = one.abNames.split(LIST_JOIN_MAGIC_SEP);
        }
        acc[key].push(one);
        return acc;
      },
      {}
    );
}


function buildSbjIsoLookup(sbjIsoPayload) {
  return sbjIsoPayload
    .reduce(
      (acc, {
        refName,
        subjectName,
        isolateDate,
        isEmerging,
        isWaning,
        ...one
      }) => {
        const sbjKey = `${refName}${LIST_JOIN_MAGIC_SEP}${subjectName}`;
        acc[sbjKey] = acc[sbjKey] || {};
        acc[sbjKey][isolateDate] = acc[sbjKey][isolateDate] || {
          isolateDate,
          mutations: []
        };
        if (isEmerging !== undefined) {
          one.isEmerging = !!isEmerging;
        }
        if (isWaning !== undefined) {
          one.isWaning = !!isWaning;
        }
        acc[sbjKey][isolateDate].mutations.push(one);
        return acc;
      },
      {}
    );
}


function calcTiming(start, end) {
  const timing = (end - start) / 86400000 / 30;
  return timing > 1 ? Math.round(timing) : Math.ceil(timing);
}


function buildSbjArray(
  payload,
  sbjIsoLookup,
  sbjWaningMutLookup,
  sbjRxLookup
) {
  return Object.values(payload.reduce(
    (acc, {
      refName,
      subjectName,
      subjectSpecies,
      subjectAge,
      numSubjects,
      immuneStatus,
      infectedVarName,
      infectionDate,
      severity,
      ...mut
    }) => {

      const infectDate = new Date(infectionDate);
      const key = `${refName}${LIST_JOIN_MAGIC_SEP}${subjectName}`;
      if (!(key in acc)) {
        const isolates = Object.entries(sbjIsoLookup[key] || {})
          .map(([dt, one]) => {
            const timing = calcTiming(infectDate, new Date(one.isolateDate));
            const waningMuts = (sbjWaningMutLookup[key] || {})[dt] || {};
            return {
              ...one,
              timing,
              waningMutations: waningMuts.mutations || []
            };
          });

        const treatments = (sbjRxLookup[key] || [])
          .map(one => {
            const timing = calcTiming(infectDate, new Date(one.startDate));
            const endTiming = calcTiming(infectDate, new Date(one.endDate));
            return {
              ...one,
              timing,
              endTiming
            };
          });

        acc[key] = {
          refName,
          subjectName,
          subjectSpecies,
          subjectAge,
          numSubjects,
          immuneStatus,
          infectedVarName,
          infectionDate,
          severity,
          isolates,
          treatments,
          mutations: []
        };
      }
      mut.timing = calcTiming(infectDate, new Date(mut.appearanceDate));
      acc[key].mutations.push(mut);
      return acc;
    },
    {}
  ));
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
      abNames,
      naive
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine;
  const {
    sql,
    sbjIsoSql,
    sbjWaningMutSql,
    sbjRxSql,
    params
  } = usePrepareQuery({
    refName,
    abNames,
    varName,
    infectedVarName,
    isoAggkey,
    genePos,
    naive,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const {
    payload: sbjIsoPayload,
    isPending: isSbjIsoPending
  } = useQuery({sql: sbjIsoSql, params, skip});

  const {
    payload: sbjWaningMutPayload,
    isPending: isSbjWaningMutPending
  } = useQuery({sql: sbjWaningMutSql, params, skip});

  const {
    payload: sbjRxPayload,
    isPending: isSbjRxPending
  } = useQuery({sql: sbjRxSql, params, skip});

  const shouldSkip = (
    skip ||
    isPending ||
    isSbjIsoPending ||
    isSbjWaningMutPending ||
    isSbjRxPending
  );

  const inVivoSbjs = React.useMemo(
    () => {
      if (shouldSkip) {
        return [];
      }

      const sbjRxLookup = buildSbjRxLookup(sbjRxPayload);
      const sbjIsoLookup = buildSbjIsoLookup(sbjIsoPayload);
      const sbjWaningMutLookup = buildSbjIsoLookup(sbjWaningMutPayload);
      const sbjs = buildSbjArray(
        payload,
        sbjIsoLookup,
        sbjWaningMutLookup,
        sbjRxLookup
      );

      return sbjs;
    },
    [
      shouldSkip,
      payload,
      sbjRxPayload,
      sbjIsoPayload,
      sbjWaningMutPayload
    ]
  );

  const contextValue = {
    inVivoSbjs,
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
