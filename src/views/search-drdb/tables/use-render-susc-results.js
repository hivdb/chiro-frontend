import React from 'react';
import {Header} from 'semantic-ui-react';
import {H3} from 'sierra-frontend/dist/components/heading-tags';

import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';


const type2Section = {
  'individual-mutation': 'indivMut',
  'named-variant': 'comboMuts',
  'mutation-combination': 'comboMuts'
};

export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  suscResults,
  variantLookup,
  indivMutColumnDefs,
  comboMutsColumnDefs
}) {

  const suscResultsBySection = React.useMemo(
    () => {
      if (!loaded) {
        return;
      }
      return suscResults.reduce(
        (acc, sr) => {
          const {type} = variantLookup[sr.variantName];
          const section = type2Section[type];
          acc[section] = acc[section] || [];
          acc[section].push(sr);
          return acc;
        },
        {}
      );
    },
    [loaded, suscResults, variantLookup]
  );


  return React.useMemo(
    () => {
      if (loaded) {
        const sections = Object.keys(suscResultsBySection);
        const indivTable = (
          sections.includes('indivMut') ?
            <SimpleTable
             cacheKey={`${id}_indiv-mut_${cacheKey}`}
             columnDefs={indivMutColumnDefs}
             data={suscResultsBySection.indivMut} /> : null
        );
        const comboTable = (
          sections.includes('comboMuts') ?
            <SimpleTable
             cacheKey={`${id}_combo-muts_${cacheKey}`}
             columnDefs={comboMutsColumnDefs}
             data={suscResultsBySection.comboMuts} /> : null
        );
        if (sections.length === 2) {
          return <>
            <section>
              <Header as={H3} id={`${id}_indiv-mut`}>
                Individual mutation
              </Header>
              {indivTable}
            </section>
            <section>
              <Header as={H3} id={`${id}_combo-muts`}>
                Variant / mutation combination
              </Header>
              {comboTable}
            </section>
          </>;
        }
        else if (sections.length === 1) {
          return <>
            {indivTable}
            {comboTable}
          </>;
        }
        else {
          return "No susceptibility data is found for this request.";
        }
      }
      else {
        return <InlineLoader />;
      }
    },
    [
      id,
      loaded,
      cacheKey,
      indivMutColumnDefs,
      comboMutsColumnDefs,
      suscResultsBySection
    ]
  );
}
