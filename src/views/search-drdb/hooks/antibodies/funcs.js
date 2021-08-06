import maxBy from 'lodash/maxBy';

export function compareAntibodyLists(abListA, abListB) {
  const priorityA = maxBy(abListA, 'priority').priority;
  const priorityB = maxBy(abListB, 'priority').priority;
  let cmp = priorityA - priorityB;
  if (cmp) { return cmp; }
  cmp = abListA.length - abListB.length;
  return cmp;
}
