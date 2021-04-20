import useQuery from './use-query';


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
}


export default function useAntibodies({
  visibility = true,
  join = ['synonyms'],
  skip = false
} = {}) {
  let where = '';
  if (visibility === true) {
    where = 'where visibility = 1';
  }
  else if (visibility === false) {
    where = 'where visibility = 0';
  }

  const sql = `
    SELECT ab_name, abbreviation_name, availability, priority, visibility
    FROM antibodies
    ${where}
    ORDER BY priority, ab_name
  `;

  const {
    payload: antibodies,
    isPending
  } = useQuery({sql, skip});

  let antibodyLookup = {};
  if (!skip && !isPending && antibodies) {
    antibodyLookup = antibodies.reduce(
      (acc, ab) => {
        acc[ab.abName] = ab;
        return acc;
      },
      {}
    );
  }

  useJoinSynonyms({
    antibodyLookup,
    skip: skip || isPending || !join.includes('synonyms')
  });

  return {antibodies, antibodyLookup, isPending};
}
