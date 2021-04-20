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
  const {match} = useRouter();
  const {
    location: {
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: mutationText = '',
        antibodies: antibodyText = ''
      } = {}
    }
  } = match;

  return React.useMemo(
    () => {
      const mutations = parseMutations(mutationText);
      const abNames = parseAntibodies(antibodyText);
      return {
        formOnly,
        refName,
        mutations,
        abNames,
        onChange: () => null // TODO
      };
    },
    [formOnly, refName, mutationText, antibodyText]
  );
}
