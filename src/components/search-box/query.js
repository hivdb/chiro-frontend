import React from 'react';
import {Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/react-hooks';

import searchPromptsQuery from './search-prompts.gql';


function reformQueryData(data) {
  const {articles, compoundTargets, compounds, viruses} = data;
  return [
    ...articles.edges.map(
      ({node: {nickname: [nickname]}}) => ({
        title: nickname,
        category: 'articles'
      })
    ),
    ...compoundTargets.edges.map(
      ({node: {name}}) => ({
        title: name,
        category: 'compoundTargets'
      })
    ),
    ...compounds.edges.map(
      ({node: {name, target}}) => ({
        title: name,
        target,
        category: 'compounds'
      })
    ),
    ...viruses.edges.map(
      ({node: {name}}) => ({
        title: name,
        category: 'viruses'
      })
    )
  ];
}


export default function LoadSuggestions({children}) {
  let {loading, error, data} = useQuery(searchPromptsQuery);
  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  data = reformQueryData(data);
  return children(data);
}
