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
  filterByAbNames,
  filterByInfectedVarName,
  queryRxType,
  queryAbNames
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const InVitroMutationsContext = React.createContext();


function usePrepareQuery({
  refName,
  abNames,
  varName,
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

      if (varName) {
        where.push('false');
      }
      else {
        filterSpike({where});
        filterByRefName({refName, where, params});
        filterByIsoAggkey({isoAggkey, where, params});
        filterByGenePos({genePos, where, params});
        filterByAbNames({abNames, where, params});
        filterByInfectedVarName({infectedVarName, where, params});
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          M.rx_name,
          ${queryRxType()},
          ${queryAbNames()},
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
    [abNames, varName, genePos, infectedVarName, isoAggkey, refName, skip]
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
      varName,
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
    varName,
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
