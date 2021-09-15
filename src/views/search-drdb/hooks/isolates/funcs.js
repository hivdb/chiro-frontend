import {ORDERED_ISOLATE_TYPE} from './types';


export function countSpikeMutations(mutations) {
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


export function classifyIsolate({numMuts}) {
  if (numMuts === 1) {
    return 'individual-mutation';
  }
  else {
    return 'mutation-combination';
  }
}


export function compareIsolates(isolateA, isolateB) {
  if (!isolateA) {
    return 1;
  }
  if (!isolateB) {
    return -1;
  }
  if (isolateA.isoName === isolateB.isoName) {
    // short-cut if the isolate names are the same
    return 0;
  }
  const typeA = ORDERED_ISOLATE_TYPE.indexOf(isolateA.type);
  const typeB = ORDERED_ISOLATE_TYPE.indexOf(isolateB.type);

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
  mutationsA = mutationsA || [];
  mutationsB = mutationsB || [];
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
    if (mutA.aminoAcid < mutB.aminoAcid) {
      return -1;
    }
    else if (mutA.aminoAcid > mutB.aminoAcid) {
      return 1;
    }
  }
  // shorter first, isolateA is shorter than isolateB
  return mutationsA.length - mutationsB.length;
}
