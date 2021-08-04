import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/client';

import ArticleInfo from '../article-info';
import ArticleAbstractInfo from '../article-abstract-info';

import query from './query.gql.js';


function mergeReferences(references, dbArticles, setRef) {
  const articleLookup = dbArticles.edges
    .reduce((acc, {node}) => {
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
    }, {});

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
        setRef(name, {children}, /* incr= */false);
        return {...refProps, children};
      })
  );
}


export default function RefDataLoader({
  references,
  setReference,
  onLoad
}) {
  let {loading, error, data} = useQuery(query);

  React.useEffect(
    () => {
      if (!loading && !error) {
        mergeReferences(references, data.articles, setReference);
        onLoad();
      }
    },
    [onLoad, loading, error, references, data, setReference]
  );

  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return null;
}

RefDataLoader.propTypes = {
  references: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  setReference: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired
};

RefDataLoader.defaultProps = {
  onLoad: () => null
};

