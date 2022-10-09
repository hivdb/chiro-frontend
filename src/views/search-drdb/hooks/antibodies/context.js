import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const AntibodiesContext = React.createContext();

AntibodiesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function AntibodiesProvider({children}) {
  const sql = `
    SELECT
      A.ab_name,
      abbreviation_name,
      availability,
      priority,
      visibility,
      mature_month,
      AT.class AS ab_class,
      AT.target AS ab_target,
      (
        SELECT GROUP_CONCAT(SYN.synonym, $joinSep)
        FROM antibody_synonyms SYN
        WHERE
          SYN.ab_name = A.ab_name
        ORDER BY SYN.synonym
      ) AS synonyms,
      (
        SELECT GROUP_CONCAT(CAST(EPT.position AS TEXT), $joinSep)
        FROM antibody_epitopes EPT
        WHERE
          EPT.ab_name = A.ab_name
        ORDER BY EPT.position
      ) AS epitopes
    FROM antibodies A
    LEFT JOIN antibody_targets AT ON
      A.ab_name=AT.ab_name AND AT.source='structure'
    ORDER BY priority, A.ab_name
  `;
  const params = React.useMemo(
    () => ({
      $joinSep: LIST_JOIN_MAGIC_SEP
    }),
    []
  );
  const {
    payload: antibodies,
    isPending
  } = useQuery({sql, params});

  const antibodyLookup = React.useMemo(
    () => isPending || !antibodies ? {} : antibodies.reduce(
      (acc, ab) => {
        acc[ab.abName] = ab;
        ab.visibility = ab.visibility === 1;
        ab.synonyms = ab.synonyms ?
          ab.synonyms.split(LIST_JOIN_MAGIC_SEP) : [];
        ab.epitopes = ab.epitopes ?
          ab.epitopes
            .split(LIST_JOIN_MAGIC_SEP)
            .map(pos => Number.parseInt(pos)) : [];
        ab.isApproved = [
          'EUA',
          'Approved',
          'CN-Approved',
          'KR-Approved',
          'EU-Approved'
        ].includes(ab.availability);
        return acc;
      },
      {}
    ),
    [isPending, antibodies]
  );

  const contextValue = {
    antibodies,
    antibodyLookup,
    isPending
  };

  return <AntibodiesContext.Provider value={contextValue}>
    {children}
  </AntibodiesContext.Provider>;
}

function useAntibodies() {
  return React.useContext(AntibodiesContext);
}

function useCurrent() {
  const {
    params: {
      abNames
    }
  } = LocationParams.useMe();
  const {antibodyLookup, isPending} = React.useContext(AntibodiesContext);
  let antibodies = [];
  if (abNames && abNames.length > 0) {
    antibodies = abNames
      .map(abName => (antibodyLookup || {})[abName])
      .filter(ab => ab);
  }
  return {antibodies, isPending};
}

const Antibodies = {
  Provider: AntibodiesProvider,
  useAll: useAntibodies,
  useCurrent
};

export default Antibodies;
