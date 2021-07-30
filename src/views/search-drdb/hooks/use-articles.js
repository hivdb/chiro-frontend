import React from 'react';
import useQuery from './use-query';


export default function useArticles({
  skip = false
} = {}) {

  const sql = `
    SELECT
      R.ref_name,
      first_author,
      year
    FROM articles R
    WHERE EXISTS (
      SELECT 1 FROM susc_summary S
      WHERE R.ref_name = S.ref_name
    )
    ORDER BY R.ref_name
  `;

  const {
    payload,
    isPending
  } = useQuery({sql, skip});

  const articles = React.useMemo(
    () => {
      if (skip || isPending || !payload) {
        return [];
      }
      return payload.map(
        article => {
          const {refName, firstAuthor, year} = article;
          let suffix = refName.slice(-1);
          if (!isNaN(suffix)) {
            suffix = '';
          }
          const displayName = `${firstAuthor} (${year}${suffix})`;
          return {
            ...article,
            displayName
          };
        }
      );
    },
    [skip, isPending, payload]
  );

  const articleLookup = React.useMemo(
    () => skip || isPending || !articles ? {} : articles.reduce(
      (acc, article) => {
        acc[article.refName] = article;
        return acc;
      },
      {}
    ),
    [skip, isPending, articles]
  );

  return {articles, articleLookup, isPending};
}
