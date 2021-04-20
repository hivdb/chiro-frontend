import useSuscResults from './use-susc-results';


export default function useConvPlasmaSuscResults({
  refName,
  spikeMutations,
  skip = false
}) {

  const addColumns = [];
  const joinClause = [];

  if (!skip) {
    addColumns.push('infection');
    addColumns.push('timing');
    addColumns.push('severity');

    joinClause.push(`
      JOIN rx_conv_plasma RXCP ON
        S.ref_name = RXCP.ref_name AND
        S.rx_name = RXCP.rx_name
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
