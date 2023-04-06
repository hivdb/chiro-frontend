import {consecutiveGroupsBy} from 'icosa/utils/array-groups';


function uniqTreatments(treatments) {
  const uniq = {};
  for (const {
    rxType,
    rxName,
    abNames
  } of treatments) {
    let abs;
    const rx = {rxType, rxName, abNames};
    switch (rxType) {
      case 'antibody':
        abs = abNames.join('+');
        uniq[abs] = rx;
        break;
      case 'conv-plasma':
        uniq.$cp = rx;
        break;
      case 'vacc-plasma':
        uniq.$vp = rx;
        break;
      default:
        uniq[rxName] = rx;
        break;
    }
  }
  return Object.values(uniq);
}


export function groupByIsolates(inVivoSbjs) {
  const isoRows = [];
  for (const {isolates, ...sbjRow} of inVivoSbjs) {
    for (let idx = 0; idx < isolates.length; idx ++) {
      const iso = isolates[idx];
      const isoDate = new Date(iso.isolateDate);
      const treatments = sbjRow.treatments.filter(
        ({startDate}) => new Date(startDate) < isoDate
      );
      const emergingMutations = idx === 0 ?
        iso.mutations : iso.mutations.filter(
          ({isEmerging}) => isEmerging
        );
      if (idx === 0 || emergingMutations.length > 0) {
        isoRows.push({
          ...sbjRow,
          isBaseline: idx === 0,
          infectionTiming: iso.timing,
          treatments: uniqTreatments(treatments),
          mutations: iso.mutations,
          emergingMutations,
          waningMutations: iso.waningMutations
        });
      }
    }
  }

  // remove duplicated isolates
  return Array.from(consecutiveGroupsBy(
    isoRows,
    (left, right) => (
      left.refName === right.refName &&
      left.subjectName === right.subjectName &&
      left.infectedVarName === right.infectedVarName &&
      left.infectionDate === right.infectionDate &&
      JSON.stringify(left.treatments) ===
      JSON.stringify(right.treatments) &&
      left.isBaseline === right.isBaseline &&
      JSON.stringify(left.mutations) ===
      JSON.stringify(right.mutations) &&
      JSON.stringify(left.emergingMutations) ===
      JSON.stringify(right.emergingMutations) &&
      JSON.stringify(left.waningMutations) ===
      JSON.stringify(right.waningMutations)
    )
  )).map(group => {
    const [{
      refName,
      subjectName,
      subjectSpecies,
      subjectAge,
      numSubjects,
      immuneStatus,
      infectedVarName,
      infectionDate,
      treatments,
      isBaseline,
      mutations,
      emergingMutations,
      waningMutations
    }] = group;
    const minTiming = Math.min(...group.map(
      ({infectionTiming}) => infectionTiming
    ));
    const maxTiming = Math.max(...group.map(
      ({infectionTiming}) => infectionTiming
    ));
    return {
      refName,
      subjectName,
      subjectSpecies,
      subjectAge,
      numSubjects,
      immuneStatus,
      infectedVarName,
      infectionDate,
      treatments,
      infectionTiming: [minTiming, maxTiming],
      isBaseline,
      mutations,
      emergingMutations,
      waningMutations
    };
  });
}
