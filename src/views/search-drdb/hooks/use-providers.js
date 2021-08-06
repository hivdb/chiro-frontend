import React from 'react';

import Articles from './articles';
import Antibodies from './antibodies';
import Vaccines from './vaccines';
import InfectedVariants from './infected-variants';
import Variants from './variants';
import LocationParams from './location-params';

const providers = {
  locationParams: LocationParams.Provider,
  articles: Articles.Provider,
  antibodies: Antibodies.Provider,
  vaccines: Vaccines.Provider,
  infectedVariants: InfectedVariants.Provider,
  variants: Variants.Provider
};


// dependency order: bottom ones are depended on the top ones
const defaultProviderNames = [
  'locationParams',
  'articles',
  'antibodies',
  'vaccines',
  'infectedVariants',
  'variants'
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
