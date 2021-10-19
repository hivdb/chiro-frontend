import React from 'react';

import LocationParams from './location-params';
import Articles from './articles';
import Antibodies from './antibodies';
import Vaccines from './vaccines';
import InfectedVariants from './infected-variants';
import Variants from './variants';
import Isolates from './isolates';
import IsolateAggs from './isolate-aggs';
import Positions from './positions';
import SuscSummary from './susc-summary';
import SuscResults from './susc-results';
import InVitroMutations from './invitro-mutations';
import DMSMutations from './dms-mutations';
import MutationComments from './mutation-comments';

const providers = {
  locationParams: LocationParams.Provider,
  articles: Articles.Provider,
  antibodies: Antibodies.Provider,
  vaccines: Vaccines.Provider,
  infectedVariants: InfectedVariants.Provider,
  variants: Variants.Provider,
  isolates: Isolates.Provider,
  isolateAggs: IsolateAggs.Provider,
  positions: Positions.Provider,
  suscSummary: SuscSummary.Provider,
  suscResults: SuscResults.Provider,
  inVitroMutations: InVitroMutations.Provider,
  dmsMutations: DMSMutations.Provider,
  MutationComments: MutationComments.Provider
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
    'positions',
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
    'positions',
    'suscSummary',
    'suscResults',
    'inVitroMutations',
    'dmsMutations',
    'MutationComments'
  ]
};


export default function useProviders(preset, providerProps = {}) {
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
        element = <Provider {...providerProps[name]}>{element}</Provider>;
      }
      return element;
    },
    [providerNames, providerProps]
  );

}
