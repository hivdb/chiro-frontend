export function aggSum(nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}


function zip(array, ...others) {
  return array.map(
    (item, idx) => [
      item,
      ...others.map(other => other[idx])
    ]
  );
}


export function aggWeightedPercentile(values, weights, percentiles) {
  const totalWeight = aggSum(weights) - 1;
  const pcntWeights = percentiles.map(pcnt => totalWeight * pcnt);
  const sorted = zip(values, weights)
    .filter(([v, w]) => !isNaN(v) && !isNaN(w) && w !== 0)
    .sort(([v1], [v2]) => v1 - v2);
  return pcntWeights.map(
    pcntWeight => {
      let prevValue;
      let prevCumWeight, cumWeight = 0;
      for (const [value, weight] of sorted) {
        if (cumWeight < pcntWeight) {
          prevValue = value;
        }
        else if (prevValue === undefined) {
          return value;
        }
        else {
          // linear interpolation
          const weightDiff = cumWeight - prevCumWeight;
          const valueDiff = value - prevValue;
          return valueDiff * (
            pcntWeight - prevCumWeight
          ) / weightDiff + prevValue;
        }
        prevCumWeight = cumWeight;
        prevValue = value;
        cumWeight += weight;
      }
      return prevValue;
    }
  );
}


function groupPotencyByTypeAndUnit({
  potency,
  unlinkedPotency,
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
      potency: [],
      unlinkedPotency: []
    };
    groups[key].cumulativeCount.push(cumulativeCount[i]);
    groups[key].ineffective.push(ineffective[i]);
    groups[key].potency.push(potency[i]);
    groups[key].unlinkedPotency.push(unlinkedPotency[i]);
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
  const {
    potency,
    controlPotency,
    unlinkedPotency,
    unlinkedControlPotency,
    cumulativeCount,
    controlCumulativeCount,
    ...others
  } = row;
  const myPot = isControl ? controlPotency : potency;
  const myUnlinkedPot = isControl ? unlinkedControlPotency : unlinkedPotency;
  const myCumuCount = isControl ? controlCumulativeCount : cumulativeCount;
  const groups = groupPotencyByTypeAndUnit({
    potency: myPot,
    unlinkedPotency: myUnlinkedPot,
    cumulativeCount: myCumuCount,
    ...others
  });
  const ineffectiveCmp = isControl ? 'control' : 'experimental';
  return groups
    .map(group => {
      const potency = [];
      const cumulativeCount = [];
      group.ineffective = group.ineffective.map(ie => (
        ie === ineffectiveCmp ||
        ie === 'both'
      ));
      const ineffectivePots = [];
      const ineffPotCumuCount = [];
      const potTypeFirstTwo = group.potencyType.slice(0, 2);
      const theHigherTheMoreEffective = (
        potTypeFirstTwo === 'NT' || potTypeFirstTwo === 'NC'
      );
      for (const [idx, pot] of group.potency.entries()) {
        const unPot = group.unlinkedPotency[idx];
        const cumuCount = group.cumulativeCount[idx];
        if (!unPot || unPot.length === 0) {
          if (group.ineffective[idx]) {
            ineffectivePots.push(pot);
            ineffPotCumuCount.push(cumuCount);
            if (group.potency.length > 1 && theHigherTheMoreEffective) {
              // for NT/NC ineffective potency, use the square-root value since
              // the actual value should be much lower/higher than the
              // detection threshold
              potency.push(Math.pow(pot, .5));
            }
            else {
              potency.push(pot);
            }
          }
          else {
            potency.push(pot);
          }
          cumulativeCount.push(cumuCount);
        }
        else {
          for (const {
            potency: pot,
            ineffective: ineff,
            cumulativeCount: cumuCount
          } of unPot) {
            if (ineff) {
              ineffectivePots.push(pot);
              ineffPotCumuCount.push(cumuCount);
              if (
                (
                  group.potency.length > 1 ||
                  unPot.length > 1
                ) &&
                theHigherTheMoreEffective
              ) {
                // also apply square-root for NT/NC ineffective potency
                potency.push(Math.pow(pot, .5));
              }
              else {
                potency.push(pot);
              }
            }
            else {
              potency.push(pot);
            }
            cumulativeCount.push(cumuCount);
          }
        }
      }
      let avgPot = aggGeoMeanWeighted(
        potency,
        cumulativeCount
      );
      let potSD = aggGeoSDWeighted(
        avgPot,
        potency,
        cumulativeCount
      );
      group.ineffective = false;
      if (ineffectivePots.length > 0) {
        const cmpPot = aggGeoMeanWeighted(ineffectivePots, ineffPotCumuCount);
        if (theHigherTheMoreEffective) {
          // plus 1e-4 to "fix" binary floating quirks (#38)
          if (avgPot <= cmpPot + 1e-4) {
            avgPot = cmpPot;
            group.ineffective = true;
          }
        }
        else {
          // minus 1e-4 to "fix" binary floating quirks (#38)
          if (avgPot >= cmpPot - 1e-4) {
            avgPot = cmpPot;
            group.ineffective = true;
          }
        }
      }
      group.potency = avgPot;
      group.potencySD = potSD;
      group.cumulativeCount = aggSum(cumulativeCount);
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


export function aggDataAvailability(_, {unlinkedPotency, cumulativeCount}) {
  return (
    cumulativeCount.length > 1 ||
    cumulativeCount[0] === 1 ||
    unlinkedPotency.some(one => one && one.length > 0)
  );
}
