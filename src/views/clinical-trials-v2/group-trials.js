import moment from 'moment';

export function groupTrials1(clinicalTrials, qCompoundTargetName) {
  let allTrials = [];
  for (const {node: {compoundObjs, ...trial}} of clinicalTrials) {
    let theseTrials = [];
    let compoundNames = [];
    let oldTargets = [];
    for (let {target, primaryCompound, relatedCompounds} of compoundObjs) {
      if (!target) {
        target = 'Uncertain';
      }
      if (target) {
        oldTargets.push(target);
      }
      if (primaryCompound) {
        compoundNames.push(primaryCompound.name);
      }
      for (const {name} of relatedCompounds) {
        if (name) {
          compoundNames.push(name);
        }
      }
    }

    let isHCQTrial = false;
    if (
      compoundNames.includes('Hydroxychloroquine') ||
      compoundNames.includes('Chloroquine')) {
      isHCQTrial = true;
      let target = "Hydroxychloroquine";
      theseTrials.push(
        {...trial, target, oldTargets}
      );
    }
    if (isHCQTrial) {
      allTrials = allTrials.concat(theseTrials);
      continue;
    }

    let usedTarget = [];
    for (let {target} of compoundObjs) {
      if (!target) {
        target = 'Uncertain';
      }

      if (usedTarget.includes(target)) {
        continue;
      }
      theseTrials.push({...trial, target});
      usedTarget.push(target);
    }

    allTrials = allTrials.concat(theseTrials);
  }
  if (qCompoundTargetName) {
    allTrials = allTrials.filter(({target, oldTargets}) => {
      if (
        target === 'Hydroxychloroquine' &&
        oldTargets.includes(qCompoundTargetName)
      ) {
        return true;
      }
      if (target === qCompoundTargetName) {
        return true;
      } else {
        return false;
      }
    });
  }
  return allTrials;
}

export function groupTrials2(clinicalTrials, qCompoundTargetName) {
  let allTrials = [];
  for (const {node: {compoundObjs, ...trial}} of clinicalTrials) {
    let theseTrials = [];
    let usedTarget = [];
    for (let {target, primaryCompound, relatedCompounds} of compoundObjs) {
      if (!target) {
        continue;
      }
      let compoundNames = [];
      if (primaryCompound) {
        compoundNames.push(primaryCompound.name);
      }
      for (const {name} of relatedCompounds) {
        if (name) {
          compoundNames.push(name);
        }
      }
      let oldTarget = null;
      if (compoundNames.includes('Hydroxychloroquine') ||
          compoundNames.includes('Chloroquine')) {
        oldTarget = target;
        target = "Hydroxychloroquine";
      }
      if (usedTarget.includes(target)) {
        continue;
      } else {
        theseTrials.push({...trial, target, oldTarget});
        usedTarget.push(target);
      }
    }
    if (usedTarget.length === 0) {
      let target = 'Uncertain';
      theseTrials.push({...trial, target});
    }

    allTrials = allTrials.concat(theseTrials);
  }
  if (qCompoundTargetName) {
    allTrials = allTrials.filter(({target, oldTarget}) => {
      if (target === 'Hydroxychloroquine') {
        target = oldTarget;
      }
      if (target === qCompoundTargetName) {
        return true;
      } else {
        return false;
      }
    });
  }
  return allTrials;
}

function isDelayed(date) {
  const today = moment();
  date = moment(date);
  if (date.isValid()) {
    if (moment.duration(today.diff(date)).months() > 4) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

export function markDelayed(clinicalTrials) {
  let result = [];
  for (let {node: {...trials}} of clinicalTrials) {
    if (trials['recruitmentStatus'] === 'Pending' &&
       isDelayed(trials['startDate'])) {
      trials['recruitmentStatus'] = 'Delayed';
    }
    result.push({node: trials});
  }
  return result;
}
