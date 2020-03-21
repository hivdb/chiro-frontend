import React from 'react';
import {Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/react-hooks';

import searchPromptsQuery from './search-prompts.gql';


function resultContainer({children, className, onClick, onMouseDown}) {
  // Whitelist props passing to <div> to prevent warnings.
  // This function was passed to <Search> prop results as an attribute "as".
  // Check source code Search.js and SearchResult.js of semantic-ui-react for
  // how it works.
  return <div {...{className, onClick, onMouseDown}}>
    {children}
  </div>;
}


function reformQueryData(data) {
  const {compounds, viruses} = data;
  return [
    ...compounds.edges.map(
      ({node: {name, synonyms, relatedCompounds,
        drugClassName, description
      }}) => ({
        as: resultContainer,
        title: name,
        synonyms,
        relatedCompounds: relatedCompounds.reduce(
          (acc, {name, synonyms}) => [...acc, name, ...synonyms],
          []
        ),
        type: drugClassName,
        drugClass: drugClassName,
        description,
        category: 'compounds'
      })
    ),
    ...viruses.edges.map(
      ({node: {name, fullName, synonyms,
        typeName, description
      }}) => ({
        as: resultContainer,
        title: name,
        fullName, synonyms,
        type: typeName,
        virusType: typeName,
        description,
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
