import {consecutiveGroupsBy} from 'sierra-frontend/dist/utils/array-groups';


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
    for (const iso of isolates) {
      const isoDate = new Date(iso.isolateDate);
      const treatments = sbjRow.treatments.filter(
        ({startDate}) => new Date(startDate) < isoDate
      );
      isoRows.push({
        ...sbjRow,
        infectionTiming: iso.timing,
        treatments: uniqTreatments(treatments),
        mutations: iso.mutations,
        waningMutations: iso.waningMutations
      });
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
      JSON.stringify(left.mutations) ===
      JSON.stringify(right.mutations)
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
      mutations,
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
      mutations,
      waningMutations
    };
  });
}
