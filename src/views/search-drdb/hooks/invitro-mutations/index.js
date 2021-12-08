import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {getMutations} from '../isolate-aggs';

import useSummaryByArticle from './use-summary-by-article';
import useSummaryByRx from './use-summary-by-rx';
import useSummaryByVirus from './use-summary-by-virus';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const InVitroMutationsContext = React.createContext();


function usePrepareQuery({
  refName,
  abNames,
  isoAggkey,
  infectedVarName,
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
      if (realAbNames && realAbNames.length > 0) {
        const excludeAbQuery = [];
        for (const [idx, abName] of realAbNames.entries()) {
          where.push(`
            EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name AND
              RXMAB.ab_name = $abName${idx}
            )
          `);
          params[`$abName${idx}`] = abName;
          excludeAbQuery.push(`$abName${idx}`);
        }
      }
      if (infectedVarName) {
        where.push(`
          RXCP.rx_name IS NOT NULL AND
          (
            $infVarName = 'any' OR
            ($infVarName = 'Wild Type' AND INFVAR.as_wildtype IS TRUE) OR
            (INFISO.var_name = $infVarName)
          )
          
        `);
        params.$infVarName = infectedVarName;
      }
      else if (abNames.some(n => n === 'any')) {
        where.push(`
          EXISTS (
            SELECT 1 FROM rx_antibodies RXMAB
            WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name
          )
        `);
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          M.rx_name,
          CASE
            WHEN EXISTS (
              SELECT 1 FROM rx_conv_plasma RXCP
              WHERE
                RXCP.ref_name = M.ref_name AND
                RXCP.rx_name = M.rx_name
            ) THEN 'conv-plasma'
            WHEN EXISTS (
              SELECT 1 FROM rx_vacc_plasma RXVP
              WHERE
                RXVP.ref_name = M.ref_name AND
                RXVP.rx_name = M.rx_name
            ) THEN 'vacc-plasma'
            WHEN EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
                RXMAB.ref_name = M.ref_name AND
                RXMAB.rx_name = M.rx_name
            ) THEN 'antibody'
            ELSE 'unclassified'
          END AS rx_type,
          (
            SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
            FROM rx_antibodies RXMAB, antibodies MAB
            WHERE
              M.ref_name = RXMAB.ref_name AND
              M.rx_name = RXMAB.rx_name AND
              RXMAB.ab_name = MAB.ab_name
            ORDER BY MAB.priority, RXMAB.ab_name
          ) AS ab_names,
          M.gene,
          R.amino_acid as ref_amino_acid,
          M.position,
          M.amino_acid,
          CASE
            WHEN INFVAR.as_wildtype THEN 'Wild Type'
            ELSE INFVAR.var_name
          END AS infected_var_name,
          section,
          date_added
        FROM invitro_selection_results M
        JOIN ref_amino_acid R ON
          R.gene = M.gene AND R.position = M.position
        LEFT JOIN rx_conv_plasma RXCP ON
          RXCP.ref_name = M.ref_name AND
          RXCP.rx_name = M.rx_name
        LEFT JOIN isolates INFISO ON
          RXCP.infected_iso_name = INFISO.iso_name
        LEFT JOIN variants INFVAR ON
          INFISO.var_name = INFVAR.var_name

        WHERE
          (${where.join(') AND (')})
      `;
      return {
        sql,
        params
      };
    },
    [abNames, genePos, infectedVarName, isoAggkey, refName, skip]
  );
}

InVitroMutationsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function InVitroMutationsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      infectedVarName,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine;
  const {
    sql,
    params
  } = usePrepareQuery({
    abNames,
    refName,
    isoAggkey,
    infectedVarName,
    genePos,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const inVitroMuts = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        mut => {
          mut.abNames = (
            mut.abNames ? mut.abNames.split(LIST_JOIN_MAGIC_SEP) : []
          );
          return mut;
        }
      );
    },
    [isPending, payload, skip]
  );
  const contextValue = {
    inVitroMuts,
    isPending: skip || isPending
  };

  return <InVitroMutationsContext.Provider value={contextValue}>
    {children}
  </InVitroMutationsContext.Provider>;
}

function useInVitroMutations() {
  return React.useContext(InVitroMutationsContext);
}

const InVitroMutations = {
  Provider: InVitroMutationsProvider,
  useMe: useInVitroMutations,
  useSummaryByArticle,
  useSummaryByRx,
  useSummaryByVirus
};

export default InVitroMutations;
