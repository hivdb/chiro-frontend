import React from 'react';
import isEqual from 'lodash/isEqual';
import {useRouter} from 'found';


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
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query,
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: mutationText = '',
        antibodies: antibodyText = '',
        variant: varName = null,
        cp: convPlasmaValue = '',
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

  const onChange = React.useCallback(
    (action, value, clearAction = false) => {
      let query = {...loc.query};
      if (clearAction) {
        query = {};
      }
      if (typeof action === 'string') {
        query[action] = value;
      }
      else {
        query = {...query, ...action};
      }

      delete query.form_only;

      if (action === 'vaccine') {
        delete query.antibodies;
        delete query.cp;
      }
      else if (action === 'antibodies') {
        delete query.vaccine;
        delete query.cp;
      }
      else if (action === 'cp') {
        delete query.antibodies;
        delete query.vaccine;
      }
      else if (action === 'variant') {
        delete query.mutations;
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
      return {
        formOnly,
        refName,
        mutationText,
        abNames,
        varName,
        vaccineName,
        convPlasmaValue,
        onChange
      };
    },
    [
      formOnly,
      refName,
      mutationText,
      antibodyText,
      varName,
      vaccineName,
      convPlasmaValue,
      onChange
    ]
  );
}
