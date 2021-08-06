import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const AntibodiesContext = React.createContext();

function useJoinSynonyms({
  antibodyLookup,
  skip = false
}) {
  let isEmpty = skip;
  let params;
  let sql;
  if (!skip && antibodyLookup) {
    for (const ab of Object.values(antibodyLookup)) {
      ab.synonyms = [];
    }
    const abNames = Object.keys(antibodyLookup);
    isEmpty = abNames.length === 0;
    const inClause = abNames.map((n, idx) => `$abName${idx}`).join(', ');
    sql = `
      SELECT ab_name, synonym
      FROM antibody_synonyms
      WHERE ab_name IN (${inClause})
    `;
    params = abNames.reduce(
      (acc, name, idx) => {
        acc[`$abName${idx}`] = name;
        return acc;
      },
      {}
    );
  }
  const {
    payload: synonyms,
    isPending
  } = useQuery({
    sql,
    params,
    skip: skip || isEmpty
  });

  if (!skip && !isEmpty && !isPending) {
    for (const {abName, synonym} of synonyms) {
      const ab = antibodyLookup[abName];
      ab.synonyms.push(synonym);
    }
  }

  return {isPending};
}


function usePrepareQuery() {
  return React.useMemo(
    () => ({
      sql: `
          SELECT
            A.ab_name,
            abbreviation_name,
            availability,
            priority,
            visibility,
            AT.class AS ab_class
          FROM antibodies A
          LEFT JOIN antibody_targets AT ON
            A.ab_name=AT.ab_name AND AT.source='structure'
          WHERE EXISTS (
            SELECT 1 FROM susc_summary S
            WHERE
              S.aggregate_by = 'antibody:indiv' AND
              A.ab_name = S.antibody_names
          )
          ORDER BY priority, A.ab_name
        `
    }),
    []
  );
}


AntibodiesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function AntibodiesProvider({children}) {
  const {sql} = usePrepareQuery();
  const {
    payload: antibodies,
    isPending
  } = useQuery({sql});

  const antibodyLookup = React.useMemo(
    () => isPending || !antibodies ? {} : antibodies.reduce(
      (acc, ab) => {
        acc[ab.abName] = ab;
        ab.visibility = ab.visibility === 1;
        return acc;
      },
      {}
    ),
    [isPending, antibodies]
  );

  const {isPending: isSynonymPending} = useJoinSynonyms({
    antibodyLookup,
    skip: isPending
  });

  const contextValue = {
    antibodies,
    antibodyLookup,
    isPending: isPending || isSynonymPending
  };

  return <AntibodiesContext.Provider value={contextValue}>
    {children}
  </AntibodiesContext.Provider>;
}

function useAntibodies() {
  return React.useContext(AntibodiesContext);
}

const Antibodies = {
  Provider: AntibodiesProvider,
  useMe: useAntibodies
};

export default Antibodies;
