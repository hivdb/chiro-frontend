import {consecutiveGroupsBy} from 'sierra-frontend/dist/utils/array-groups';

export default function shortenMutationList(mutations) {
  mutations = mutations.filter(({gene}) => gene === 'S');
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
    if (group.length === 1) {
      const [{position, aminoAcid, refAminoAcid}] = group;
      merged.push(
        aminoAcid === 'del' ?
          `Δ${position}` :
          `${refAminoAcid}${position}${aminoAcid}`
      );
    }
    else {
      const leftest = group[0];
      const rightest = group[group.length - 1];
      const {position: posStart} = leftest;
      const {position: posEnd} = rightest;
      if (posEnd - posStart === 1) {
        merged.push(`Δ${posStart}/${posEnd}`);
      }
      else {
        merged.push(`Δ${posStart}-${posEnd}`);
      }
    }
  }
  return merged;
}
