import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const ArticlesContext = React.createContext();

ArticlesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function ArticlesProvider({children}) {

  const sql = `
    SELECT
      R.ref_name,
      doi,
      url,
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
  } = useQuery({sql});

  const articles = React.useMemo(
    () => {
      if (isPending || !payload) {
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
    [isPending, payload]
  );

  const articleLookup = React.useMemo(
    () => isPending || !articles ? {} : articles.reduce(
      (acc, article) => {
        acc[article.refName] = article;
        return acc;
      },
      {}
    ),
    [isPending, articles]
  );

  const contextValue = {articles, articleLookup, isPending};

  return <ArticlesContext.Provider value={contextValue}>
    {children}
  </ArticlesContext.Provider>;
}

function useArticles() {
  return React.useContext(ArticlesContext);
}

const Articles = {
  Provider: ArticlesProvider,
  useMe: useArticles
};

export default Articles;
