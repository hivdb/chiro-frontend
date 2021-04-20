import React from 'react';

import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import {
  useAntibodies,
  useAbSuscResults,
  useCPSuscResults,
  useVPSuscResults
} from './drdb';


export default function SearchDRDB() {
  
  const {antibodyLookup, isPending} = useAntibodies();

  const {
    suscResults: abSuscResults,
    isPending: isAbPending
  } = useAbSuscResults({
    // refName: 'FDA21',
    spikeMutations: [
      {position: 484, aminoAcid: 'K'},
      {position: 501, aminoAcid: 'Y'}
    ]
    // abNames: ['Bamlanivimab', 'Etesevimab']
  });

  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = useCPSuscResults({
    // refName: 'Greaney21',
    spikeMutations: [
      {position: 484, aminoAcid: 'K'}
    ]
  });

  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    // refName: 'Greaney21',
    spikeMutations: [
      {position: 484, aminoAcid: 'K'}
    ]
  });

  if (isPending || isAbPending || isCPPending || isVPPending) {
    return <FixedLoader />;
  }

  return <pre>
    {JSON.stringify(antibodyLookup, null, '  ')}


    {JSON.stringify(abSuscResults, null, '  ')}



    {JSON.stringify(cpSuscResults, null, '  ')}
 
    {JSON.stringify(vpSuscResults, null, '  ')}
  </pre>;

}
