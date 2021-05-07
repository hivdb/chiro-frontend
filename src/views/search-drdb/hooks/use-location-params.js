import React from 'react';
import {useRouter} from 'found';


const mutPattern = new RegExp(
  "^\\s*" +
  "([AC-IK-NP-TV-Y]?)" +
  "(\\d{1,4})" +
  "([AC-IK-NP-TV-Zid*]+)" +
  "\\s*$"
);


function parseMutations(mutationText) {
  return mutationText
    .split(',')
    .filter(mut => mutPattern.test(mut))
    .reduce(
      (acc, mut) => {
        let [,, pos, aas] = mutPattern.exec(mut);
        pos = parseInt(pos);
        for (const aa of aas) {
          acc.push({
            position: pos,
            aminoAcid: aa
              .replace('i', 'ins')
              .replace('d', 'del')
              .replace('*', 'stop')
          });
        }
        return acc;
      }, []
    );
}


function parseAntibodies(antibodyText) {
  return antibodyText
    .split(',')
    .map(ab => ab.trim())
    .filter(ab => ab);
}


export default function useLocationParams() {
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: mutationText = '',
        mut_match: inputMutMatch,
        antibodies: antibodyText = '',
        vaccine: vaccineName = ''
      } = {}
    }
  } = match;

  const mutationMatch = (
    inputMutMatch === 'all' ? 'all' : 'any'
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

      query = Object.keys(query).sort().reduce(
        (sorted, key) => { 
          sorted[key] = query[key]; 
          return sorted;
        }, 
        {}
      );

      router.push({
        ...loc,
        query
      });
    },
    [router, loc]
  );

  return React.useMemo(
    () => {
      const mutations = parseMutations(mutationText);
      const abNames = parseAntibodies(antibodyText);
      return {
        formOnly,
        refName,
        mutations,
        mutationMatch,
        abNames,
        vaccineName,
        onChange
      };
    },
    [
      formOnly,
      refName,
      mutationText,
      mutationMatch,
      antibodyText,
      vaccineName,
      onChange
    ]
  );
}
