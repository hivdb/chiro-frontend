import React from 'react';
import isEqual from 'lodash/isEqual';
import {useRouter} from 'found';
import {
  parseAndValidateMutation,
  sanitizeMutations
} from 'sierra-frontend/dist/utils/mutation';
import useConfig from './use-config';


function parseMutations(mutationText, config) {
  const [mutList,] = sanitizeMutations(
    mutationText.split(',').filter(mut => mut.trim()),
    config,
    /* removeErrors =*/ true
  );
  return mutList.reduce(
    (acc, mut) => {
      const {gene, pos, aas, text} = parseAndValidateMutation(
        mut, config
      );
      if (aas === 'ins' || aas === 'del') {
        acc.push({
          gene,
          position: pos,
          aminoAcid: aas,
          text
        });
      }
      else {
        for (const aa of aas) {
          acc.push({
            gene,
            position: pos,
            aminoAcid: aa.replace('*', 'stop'),
            text
          });
        }
      }
      return acc;
    },
    []
  );
}


function parseAntibodies(antibodyText) {
  return antibodyText
    .split(',')
    .map(ab => ab.trim())
    .filter(ab => ab);
}


function cleanQuery(query) {
  query = {...query};
  if (query.form_only) {
    query = {
      form_only: ''
    };
  }

  if (!query.mutations || query.mutations.trim().length === 0) {
    delete query.mutations;
  }

  if (query.mut_match === 'all') {
    delete query.mut_match;
  }

  if (query.mutations !== undefined && query.variant !== undefined) {
    delete query.variant;
  }

  query = Object.keys(query).sort().reduce(
    (sorted, key) => { 
      sorted[key] = query[key]; 
      return sorted;
    }, 
    {}
  );

  return query;
}


export default function useLocationParams() {
  const {config, isPending} = useConfig();
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query,
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: mutationText = '',
        mut_match: inputMutMatch,
        antibodies: antibodyText = '',
        variant: variantName = null,
        vaccine: vaccineName = null
      } = {}
    }
  } = match;

  React.useEffect(
    () => {
      const cleanedQuery = cleanQuery(query);
      if (!isEqual(query, cleanedQuery)) {
        router.replace({
          ...loc,
          query: cleanedQuery
        });
      }
    },
    [/* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  const mutationMatch = (
    inputMutMatch === 'any' ? 'any' : 'all'
  );

  const onChange = React.useCallback(
    (action, value) => {
      let query = {...loc.query};
      query[action] = value;

      delete query.form_only;

      if (action === 'vaccine') {
        delete query.antibodies;
      }
      else if (action === 'antibodies') {
        delete query.vaccine;
      }
      else if (action === 'variant') {
        delete query.mutations;
        delete query.mut_match;
      }
      else if (action === 'mutations') {
        delete query.variant;
      }

      query = cleanQuery(query);

      router.push({
        ...loc,
        query
      });
    },
    [router, loc]
  );

  return React.useMemo(
    () => {
      const abNames = parseAntibodies(antibodyText);
      let mutations = [];
      if (!isPending) {
        mutations = parseMutations(mutationText, config);
      }
      return {
        formOnly,
        refName,
        mutations,
        mutationText,
        mutationMatch,
        abNames,
        variantName,
        vaccineName,
        onChange
      };
    },
    [
      isPending,
      config,
      formOnly,
      refName,
      mutationText,
      mutationMatch,
      antibodyText,
      variantName,
      vaccineName,
      onChange
    ]
  );
}
