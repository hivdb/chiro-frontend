import React from 'react';

import LocationParams from './location-params';
import Articles from './articles';
import Antibodies from './antibodies';
import Vaccines from './vaccines';
import InfectedVariants from './infected-variants';
import Variants from './variants';
import Isolates from './isolates';

const providers = {
  locationParams: LocationParams.Provider,
  articles: Articles.Provider,
  antibodies: Antibodies.Provider,
  vaccines: Vaccines.Provider,
  infectedVariants: InfectedVariants.Provider,
  variants: Variants.Provider,
  isolates: Isolates.Provider
};


// dependency order: top ones are depended by the bottom ones
const presetProviderNames = {
  searchBoxOnly: [
    'locationParams',
    'articles',
    'antibodies',
    'vaccines',
    'infectedVariants',
    'variants'
  ],
  all: [
    'locationParams',
    'articles',
    'antibodies',
    'vaccines',
    'infectedVariants',
    'variants',
    'isolates' // isolates depends on variants
  ]
};


export default function useProviders(preset) {
  const providerNames = [
    ...presetProviderNames[preset]
  ].reverse();

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
