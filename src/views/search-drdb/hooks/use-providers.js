import React from 'react';

import LocationParams from './location-params';
import Articles from './articles';
import Antibodies from './antibodies';
import Vaccines from './vaccines';
import InfectedVariants from './infected-variants';
import Variants from './variants';
import Isolates from './isolates';
import IsolateAggs from './isolate-aggs';
import SuscSummary from './susc-summary';
import SuscResults from './susc-results';

const providers = {
  locationParams: LocationParams.Provider,
  articles: Articles.Provider,
  antibodies: Antibodies.Provider,
  vaccines: Vaccines.Provider,
  infectedVariants: InfectedVariants.Provider,
  variants: Variants.Provider,
  isolates: Isolates.Provider,
  isolateAggs: IsolateAggs.Provider,
  suscSummary: SuscSummary.Provider,
  suscResults: SuscResults.Provider
};


// dependency order: top ones are depended by the bottom ones
const presetProviderNames = {
  searchBoxOnly: [
    'locationParams',
    'articles',
    'antibodies',
    'vaccines',
    'infectedVariants',
    'variants',
    'isolateAggs',
    'suscSummary'
  ],
  all: [
    'locationParams',
    'articles',
    'antibodies',
    'vaccines',
    'infectedVariants',
    'variants',
    'isolates', // isolates depends on variants
    'isolateAggs',
    'suscSummary',
    'suscResults'
  ]
};


export default function useProviders(preset) {
  const providerNames = React.useMemo(
    () => [
      ...presetProviderNames[preset]
    ].reverse(),
    [preset]
  );


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
