import React from 'react';
import {Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/react-hooks';

import ArticleInfo from '../../components/article-info';
import ArticleAbstractInfo from '../../components/article-abstract-info';

import query from './query.gql.js';


const IDENTIFIER_FORMAT = (
  /^(PMC\d+|PMID\d+|RefID:.+|10\.\d{4,}(?:\.\d+)*\/\S+)$/i
);


function mergeReferences(references, dbArticles) {
  const articleLookup = dbArticles.edges.reduce(
    (acc, {node}) => {
      for (const refid of node.nickname) {
        acc[`RefID:${refid.toLocaleUpperCase()}`] = node;
      }
      for (const pmcid of node.pmcid) {
        acc[`PMC${pmcid}`] = node;
      }
      for (const pmid of node.pmid) {
        acc[`PMC${pmid}`] = node;
      }
      for (const doi of node.doi) {
        acc[doi.toLocaleUpperCase()] = node;
      }
      return acc;
    }, {}
  );

  return (
    references
      .map(refProps => {
        const {name} = refProps;
        if (!IDENTIFIER_FORMAT.test(name)) {
          return refProps;
        }
        const upper = name.toLocaleUpperCase();
        const article = articleLookup[upper];
        if (!article) {
          return refProps;
        }
        return {
          ...refProps,
          children: <>
            <ArticleInfo {...article} />
            <ArticleAbstractInfo nickname={article.nickname[0]} />
          </>
        };
      })
  );
}


export default function LoadReferences({references, children}) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return mergeReferences(references, data.articles).map(children);
}
