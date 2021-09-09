export function aggSum(nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}

export function aggFold(fold, {cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // artmean for fold
  for (let i = 0; i < fold.length; i ++) {
    if (fold[i] !== undefined && fold[i] !== null) {
      total += fold[i] * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return total / sumN;
  }
}

export function aggFoldSD(avgFold, {fold, cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  for (let i = 0; i < fold.length; i ++) {
    if (fold[i] !== undefined && fold[i] !== null) {
      total += (fold[i] - avgFold) ** 2 * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.sqrt(total / sumN);
  }
}

function groupPotencyByTypeAndUnit({
  potency,
  potencyType,
  potencyUnit,
  ineffective,
  cumulativeCount
}) {
  const groups = {};
  for (let i = 0; i < potency.length; i ++) {
    const key = JSON.stringify([potencyType[i], potencyUnit[i]]);
    groups[key] = groups[key] || {
      potencyType: potencyType[i],
      potencyUnit: potencyUnit[i],
      cumulativeCount: [],
      ineffective: [],
      potency: []
    };
    groups[key].cumulativeCount.push(cumulativeCount[i]);
    groups[key].ineffective.push(ineffective[i]);
    groups[key].potency.push(potency[i]);
  }
  return Object.values(groups);
}

export function aggGeoMeanWeighted(values, weights) {
  let total = 0;
  let sumWeight = 0;
  for (let i = 0; i < values.length; i ++) {
    if (values[i] !== undefined && values[i] !== null) {
      total += Math.log(values[i]) * weights[i];
      sumWeight += weights[i];
    }
  }
  if (sumWeight) {
    return Math.exp(total / sumWeight);
  }
}

export function aggGeoSDWeighted(geoMean, values, weights) {
  let total = 0;
  let sumWeight = 0;
  // geostdev for potency
  const logGeoMean = Math.log(geoMean);
  for (let i = 0; i < values.length; i ++) {
    if (values[i] !== undefined && values[i] !== null) {
      total += (Math.log(values[i]) - logGeoMean) ** 2 * weights[i];
      sumWeight += weights[i];
    }
  }
  if (sumWeight) {
    return Math.exp(Math.sqrt(total / sumWeight));
  }
}

function internalAggPotency(row, isControl) {
  const {potency, controlPotency, ...others} = row;
  const myPot = isControl ? controlPotency : potency;
  const groups = groupPotencyByTypeAndUnit({
    potency: myPot, ...others
  });
  const ineffectiveCmp = isControl ? 'control' : 'experimental';
  return groups
    .map(group => {
      const avgPot = aggGeoMeanWeighted(
        group.potency,
        group.cumulativeCount
      );
      const potSD = aggGeoSDWeighted(
        avgPot,
        group.potency,
        group.cumulativeCount
      );
      group.potency = avgPot;
      group.potencySD = potSD;
      group.ineffective = group.ineffective.every(ie => (
        ie === ineffectiveCmp ||
        ie === 'both'
      ));
      group.cumulativeCount = aggSum(group.cumulativeCount);
      return group;
    })
    .sort(({
      potencyType: typeA,
      cumulativeCount: nA
    }, {
      potencyType: typeB,
      cumulativeCount: nB
    }) => {
      let cmp = typeA.length - typeB.length;
      if (cmp) {
        return cmp;
      }
      // lower first thus IC50 < IC80
      if (typeA < typeB) {
        return -1;
      }
      else if (typeA > typeB) {
        return 1;
      }
      // larger number first
      return nB - nA;
    })
    .filter(({potency}) => potency !== undefined && potency !== null);
}

export function aggPotency(_, row) {
  return internalAggPotency(row, false);
}

export function aggControlPotency(_, row) {
  return internalAggPotency(row, true);
}


export function aggDataAvailability(_, {cumulativeCount}) {
  return cumulativeCount.length > 1 || cumulativeCount[0] === 1;
}
