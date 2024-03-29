import {consecutiveGroupsBy} from 'icosa/utils/array-groups';

export default function shortenMutationList(
  mutations,
  asObject = false,
  spikeOnly = true
) {
  if (spikeOnly) {
    mutations = mutations.filter(({gene}) => gene === 'S');
  }
  const merged = [];
  const groups = consecutiveGroupsBy(
    mutations,
    (left, right) => (
      left.gene === right.gene &&
      left.aminoAcid === 'del' &&
      left.aminoAcid === right.aminoAcid &&
      left.position === right.position - 1
    )
  );
  for (const group of groups) {
    let text;
    const [{gene, position, aminoAcid, refAminoAcid, ...others}] = group;
    if (group.length === 1) {
      text = `${refAminoAcid}${position}${aminoAcid}`;
      if (refAminoAcid === 'ins') {
        text = `${position}ins=>${aminoAcid}`;
      }
      else if (refAminoAcid === 'del') {
        text = `${position}del=>${aminoAcid}`;
      }
      else if (aminoAcid === 'del') {
        text = `Δ${position}`;
      }
    }
    else {
      const leftest = group[0];
      const rightest = group[group.length - 1];
      const {position: posStart} = leftest;
      const {position: posEnd} = rightest;
      if (posEnd - posStart === 1) {
        text = `Δ${posStart}/${posEnd}`;
      }
      else {
        text = `Δ${posStart}-${posEnd}`;
      }
    }
    if (asObject) {
      const isEmerging = group.some(({isEmerging}) => isEmerging);
      merged.push({
        gene,
        position,
        ...others,
        text,
        isEmerging
      });
    }
    else {
      merged.push(text);
    }
  }
  return merged;
}
