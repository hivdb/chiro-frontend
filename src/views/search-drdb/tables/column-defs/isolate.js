import shortenMutList from '../../../../utils/shorten-mutlist';


export function getIsolateDisplay({isoName, isolateLookup}) {
  if (!(isoName in isolateLookup)) {
    return '?';
  }
  const {
    varName,
    synonyms,
    mutations,
    numMuts,
    expandable
  } = isolateLookup[isoName];
  const displayVarName = (
    synonyms.length > 0 ?
      `${varName} (${synonyms[0]})` : varName
  );
  const shortenMuts = shortenMutList(mutations);

  if (varName) {
    if (numMuts === 1) {
      return `${varName} (${shortenMuts.join(' + ')})`;
    }
    else {
      return displayVarName;
    }
  }
  else {
    const shortenMuts = shortenMutList(mutations);
    if (expandable && shortenMuts.length > 0) {
      return shortenMuts.join(' + ');
    }
    else {
      // not expandable or no mutations; fallback to varName
      return displayVarName;
    }
  }
}
