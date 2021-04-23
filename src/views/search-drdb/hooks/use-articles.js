import React from 'react';
import useQuery from './use-query';


export default function useArticles({
  skip = false
} = {}) {

  const sql = `
    SELECT ref_name FROM articles A
    WHERE
      EXISTS (SELECT 1 FROM susc_results S WHERE A.ref_name=S.ref_name)
    ORDER BY ref_name
  `;

  const {
    payload: articles,
    isPending
  } = useQuery({sql, skip});

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
