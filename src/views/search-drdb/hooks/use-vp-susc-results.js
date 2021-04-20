import useSuscResults from './use-susc-results';


export default function useConvPlasmaSuscResults({
  refName,
  spikeMutations,
  skip = false
}) {

  const addColumns = [];
  const joinClause = [];

  if (!skip) {
    addColumns.push('vaccine_name');
    addColumns.push('timing');
    addColumns.push('dosage');

    joinClause.push(`
      JOIN rx_immu_plasma RXVP ON
        S.ref_name = RXVP.ref_name AND
        S.rx_name = RXVP.rx_name
    `);
  }

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    spikeMutations,
    addColumns,
    joinClause,
    skip
  });

  return {suscResults, suscResultLookup, isPending};
}
