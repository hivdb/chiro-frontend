import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import useSummaryByArticle from './use-summary-by-article';
import useSummaryByRx from './use-summary-by-rx';
import useSummaryByVirus from './use-summary-by-virus';

import {
  filterByRefName,
  filterByVarName,
  filterByIsoAggkey,
  filterByGenePos,
  filterByAbNames,
  queryAbNames
} from '../sql-fragments/selection-mutations';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const DMSMutationsContext = React.createContext();


function usePrepareQuery({
  refName,
  abNames,
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

      filterByRefName({refName, where, params});
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
          rx_name,
          'antibody' AS rx_type,
          ${queryAbNames()},
          M.gene,
          R.amino_acid as ref_amino_acid,
          M.position,
          M.amino_acid,
          M.escape_score,
          B.ace2_binding,
          B.expression,
          B.ace2_contact
        FROM dms_escape_results M
        JOIN ref_amino_acid R ON
          R.gene = M.gene AND R.position = M.position
        LEFT JOIN dms_ace2_binding B ON
          B.gene = M.gene AND
          B.position = M.position AND
          B.amino_acid = M.amino_acid
        WHERE
          (${where.join(') AND (')})
      `;
      return {
        sql,
        params
      };
    },
    [abNames, varName, genePos, isoAggkey, refName, skip]
  );
}

DMSMutationsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function DMSMutationsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      varName,
      isoAggkey,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine || filterFlag.infectedVariant;
  const {
    sql,
    params
  } = usePrepareQuery({abNames, varName, refName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const dmsMuts = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        mut => {
          mut.abNames = mut.abNames.split(LIST_JOIN_MAGIC_SEP);
          mut.ace2Contact = !!mut.ace2Contact;
          return mut;
        }
      );
    },
    [isPending, payload, skip]
  );
  const contextValue = {
    dmsMuts,
    isPending: skip || isPending
  };

  return <DMSMutationsContext.Provider value={contextValue}>
    {children}
  </DMSMutationsContext.Provider>;
}

function useDMSMutations() {
  return React.useContext(DMSMutationsContext);
}

const DMSMutations = {
  Provider: DMSMutationsProvider,
  useMe: useDMSMutations,
  useSummaryByArticle,
  useSummaryByRx,
  useSummaryByVirus
};

export default DMSMutations;
