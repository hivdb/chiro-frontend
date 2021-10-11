import InVitroMutations from '../hooks/invitro-mutations';
// import LocationParams from '../hooks/location-params';

export default function InVitroMutationsTable() {
  /* const {
    params: {
      refName,
      varName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, varName, isoAggkey, abNames}); */

  const {inVitroMuts, isPending} = InVitroMutations.useMe();

  if (isPending) {
    return null;
  }

  return <pre>
    {JSON.stringify(inVitroMuts, null, '  ')}
  </pre>;
}
