import React from 'react';
import useQuery from './use-query';


function countSpikeMutations(mutations) {
  // count isolate (spike) mutations with a few exceptions
  let spikeMuts = mutations.filter(({gene}) => gene === 'S');
  let numMuts = spikeMuts.length;
  
  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos === 614 && aminoAcid === 'G'
  ));
  // const hasD614G = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    (pos === 69 || pos === 70) && aminoAcid === 'del'
  ));
  const hasRangeDel69 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos >= 141 && pos <= 146 && aminoAcid === 'del'
  ));
  const hasRangeDel141 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos >= 242 && pos <= 244 && aminoAcid === 'del'
  ));
  const hasRangeDel242 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  return numMuts + hasRangeDel69 + hasRangeDel141 + hasRangeDel242;
}


const ORDERD_ISOLATE_TYPE = [
  'individual-mutation',
  'named-variant',
  'mutation-combination'
];


function classifyIsolate({varName, mutations, numMuts}) {
  if (varName) {
    return 'named-variant';
  }
  else if (numMuts > 1) {
    return 'mutation-combination';
  }
  else {
    return 'individual-mutation';
  }
}


function useJoinMutations({
  isolateLookup,
  skip = false
}) {
  const sql = React.useMemo(
    () => {
      let sql;
      if (!skip && isolateLookup) {
        for (const isolate of Object.values(isolateLookup)) {
          isolate.mutations = [];
        }
        sql = `
          SELECT
            iso_name,
            V.gene,
            V.position,
            V.amino_acid,
            R.amino_acid AS ref_amino_acid
          FROM isolate_mutations V, ref_amino_acid R
          WHERE
            V.gene = R.gene AND
            V.position = R.position
          ORDER BY V.gene, V.position, V.amino_acid
        `;
      }
      return sql;
    },
    [skip, isolateLookup]
  );
  const {
    payload: mutations,
    isPending
  } = useQuery({
    sql,
    skip
  });

  return React.useMemo(
    () => {
      if (!skip && !isPending) {
        for (const {isoName, ...mut} of mutations) {
          const isolate = isolateLookup[isoName];
          isolate.mutations.push(mut);
        }
      }
      return {isPending};
    },
    [skip, isPending, mutations, isolateLookup]
  );
}


export function compareIsolates(isolateA, isolateB) {
  if (isolateA.isoName === isolateB.isoName) {
    // short-cut if the isolate names are the same
    return 0;
  }
  const typeA = ORDERD_ISOLATE_TYPE.indexOf(isolateA.type);
  const typeB = ORDERD_ISOLATE_TYPE.indexOf(isolateB.type);

  // 1. sort by type
  let cmp = typeA - typeB;
  if (cmp) { return cmp; }

  cmp = compareMutations(isolateA.mutations, isolateB.mutations);
  if (cmp) { return cmp; }

  // last, compare the isolate name
  return isolateA.isoName.localeCompare(isolateB.isoName);
}


export function compareMutations(mutationsA, mutationsB) {
  let cmp;
  for (const [idx, mutA] of mutationsA.entries()) {
    const mutB = mutationsB[idx];
    if (!mutB) {
      // shorter first, isolateA is longer than isolateB
      return 1;
    }
    // 2. sort by position
    cmp = mutA.position - mutB.position;
    if (cmp) { return cmp; }

    // 3. sort by AA
    cmp = mutA.aminoAcid.localeCompare(mutB.aminoAcid);
    if (cmp) { return cmp; }
  }
  // shorter first, isolateA is shorter than isolateB
  return mutationsA.length - mutationsB.length;
}


export default function useIsolates({
  skip = false
} = {}) {

  const sql = `
    SELECT I.iso_name, var_name, expandable, count AS susc_result_count
    FROM isolates I
    LEFT JOIN isolate_stats IStat ON
      I.iso_name=IStat.iso_name AND IStat.stat_group='susc_results'
  `;

  const {
    payload: isolates,
    isPending
  } = useQuery({sql, skip});

  const isolateLookup = React.useMemo(
    () => skip || isPending || !isolates ? {} : isolates.reduce(
      (acc, iso) => {
        acc[iso.isoName] = iso;
        return acc;
      },
      {}
    ),
    [skip, isPending, isolates]
  );

  const {isPending: isMutationPending} = useJoinMutations({
    isolateLookup,
    skip: skip || isPending
  });

  if (!skip && !isPending && !isMutationPending) {
    for (const isolate of isolates) {
      const numMuts = countSpikeMutations(isolate.mutations);
      isolate.numMuts = numMuts;
      isolate.type = classifyIsolate(isolate);
    }
    // isolates.sort(compareisolates);
  }

  return {
    isolates,
    isolateLookup,
    isPending: isPending || isMutationPending
  };
}
