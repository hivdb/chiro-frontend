import React from 'react';
import {Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/client';

import ArticleInfo from '../../components/article-info';
import ArticleAbstractInfo from '../../components/article-abstract-info';

import query from './query.gql.js';


function mergeReferences(references, dbArticles, setRef) {
  const articleLookup = dbArticles.edges.reduce(
    (acc, {node}) => {
      for (const refid of node.nickname) {
        acc[refid.toLocaleLowerCase()] = node;
      }
      for (const pmcid of node.pmcid) {
        acc[`pmc${pmcid}`] = node;
        acc[`pmcid${pmcid}`] = node;
      }
      for (const pmid of node.pmid) {
        acc[`${pmid}`] = node;
        acc[`pmid${pmid}`] = node;
      }
      for (const doi of node.doi) {
        acc[doi.toLocaleLowerCase()] = node;
      }
      return acc;
    }, {}
  );

  return (
    references
      .map(refProps => {
        const {name} = refProps;
        const nameKey = name.toLocaleLowerCase();
        const article = articleLookup[nameKey];
        if (!article) {
          return refProps;
        }
        const children = <>
          <ArticleInfo {...article} />
          <ArticleAbstractInfo nickname={article.nickname[0]} />
        </>;
        setRef(name, {children}, /* noIncr= */true);
        return {...refProps, children};
      })
  );
}


export default function LoadReferences({
  references,
  setReference,
  children,
  onLoad = () => null
}) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  onLoad();

  return mergeReferences(
    references, data.articles, setReference
  ).map(children);
}
