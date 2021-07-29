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


function usePrepareQuery({skip}) {
  return React.useMemo(
    () => {
      let sql;
      if (!skip) {

        sql = `
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
        `;
      }
      return {sql};
    },
    [skip]
  );
}


export default function useAntibodies({
  join = ['synonyms'],
  skip = false
} = {}) {
  const {sql} = usePrepareQuery({skip});
  const {
    payload: antibodies,
    isPending
  } = useQuery({sql, skip});

  const antibodyLookup = React.useMemo(
    () => skip || isPending || !antibodies ? {} : antibodies.reduce(
      (acc, ab) => {
        acc[ab.abName] = ab;
        ab.visibility = ab.visibility === 1;
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
