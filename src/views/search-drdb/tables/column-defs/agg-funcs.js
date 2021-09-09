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

export function aggPotency(pot, {cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // geomean for potency
  for (let i = 0; i < pot.length; i ++) {
    if (pot[i] !== undefined && pot[i] !== null) {
      total += Math.log(pot[i]) * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.exp(total / sumN);
  }
}

export function aggPotencySD(avgPot, {potency: pot, cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // geostdev for potency
  const logAvgPot = Math.log(avgPot);
  for (let i = 0; i < pot.length; i ++) {
    if (pot[i] !== undefined && pot[i] !== null) {
      total += (Math.log(pot[i]) - logAvgPot) ** 2 * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.exp(Math.sqrt(total / sumN));
  }
}

export function aggDataAvailability(_, {cumulativeCount}) {
  return cumulativeCount.length > 1 || cumulativeCount[0] === 1;
}
