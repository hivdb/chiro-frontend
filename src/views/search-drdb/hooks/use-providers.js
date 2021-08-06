import React from 'react';

import Antibodies from './antibodies';
import LocationParams from './location-params';

const providers = {
  antibodies: Antibodies.Provider,
  locationParams: LocationParams.Provider
};


// dependency order: bottom ones are depended on the top ones
const defaultProviderNames = [
  'locationParams',
  'antibodies'
];


export default function useProviders(providerNames) {
  if (!providerNames) {
    providerNames = [...defaultProviderNames].reverse();
  }

  return React.useCallback(
    ({children}) => {
      let element = children;
      for (const name of providerNames) {
        const Provider = providers[name];
        element = <Provider>{element}</Provider>;
      }
      return element;
    },
    [providerNames]
  );

}
