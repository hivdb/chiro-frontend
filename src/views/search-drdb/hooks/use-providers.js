import React from 'react';

import Articles from './articles';
import Antibodies from './antibodies';
import LocationParams from './location-params';

const providers = {
  articles: Articles.Provider,
  antibodies: Antibodies.Provider,
  locationParams: LocationParams.Provider
};


// dependency order: bottom ones are depended on the top ones
const defaultProviderNames = [
  'locationParams',
  'articles',
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
