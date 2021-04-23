import React from 'react';
import maxBy from 'lodash/maxBy';
import useQuery from './use-query';


export function compareAntibodyLists(abListA, abListB) {
  const priorityA = maxBy(abListA, 'priority').priority;
  const priorityB = maxBy(abListB, 'priority').priority;
  let cmp = priorityA - priorityB;
  if (cmp) { return cmp; }
  cmp = abListA.length - abListB.length;
  return cmp;
}


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


function usePrepareQuery({skip, visibility}) {
  return React.useMemo(
    () => {
      let sql;
      let where = '';
      if (!skip) {
        if (visibility === true) {
          where = 'where visibility = 1';
        }
        else if (visibility === false) {
          where = 'where visibility = 0';
        }

        sql = `
          SELECT ab_name, abbreviation_name, availability, priority, visibility
          FROM antibodies
          ${where}
          ORDER BY priority, ab_name
        `;
      }
      return {sql};
    },
    [skip, visibility]
  );
}



export default function useAntibodies({
  visibility = true,
  join = ['synonyms'],
  skip = false
} = {}) {
  const {sql} = usePrepareQuery({skip, visibility});
  const {
    payload: antibodies,
    isPending
  } = useQuery({sql, skip});

  const antibodyLookup = React.useMemo(
    () => skip || isPending || !antibodies ? {} : antibodies.reduce(
      (acc, ab) => {
        acc[ab.abName] = ab;
        return acc;
      },
      {}
    ),
    [skip, isPending, antibodies]
  );

  const {isPending: isSynonymPending} = useJoinSynonyms({
    antibodyLookup,
    skip: skip || isPending || !join.includes('synonyms')
  });

  return {
    antibodies,
    antibodyLookup,
    isPending: isPending || isSynonymPending
  };
}
