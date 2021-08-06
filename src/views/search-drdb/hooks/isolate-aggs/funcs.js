import {compareMutations} from '../isolates';


export function getMutations(isoAggkey) {
  const mutations = isoAggkey.split('+');
  const results = [];
  let curGene;
  for (let mut of mutations) {
    const match = /(?:([^:]+):)?(\d+)(?:-(\d+))?(\w+)/.exec(mut);
    if (match[1]) {
      curGene = match[1];
    }
    const posStart = Number.parseInt(match[2]);
    const posEnd = match[3] ? Number.parseInt(match[3]) : posStart;
    const aa = match[4];
    for (let pos = posStart; pos <= posEnd; pos ++) {
      results.push({
        gene: curGene,
        position: pos,
        aminoAcid: aa
      });
    }
  }
  return results;
}

export function compareIsolateAggs(isoAggA, isoAggB) {
  if (!isoAggA) {
    return 1;
  }
  if (!isoAggB) {
    return -1;
  }
  if (isoAggA.isoAggkey === isoAggB.isoAggkey) {
    // short-cut if the isolate aggkeys are the same
    return 0;
  }

  return compareMutations(isoAggA.mutations, isoAggB.mutations);
}
