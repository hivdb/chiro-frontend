import React from 'react';
import {Header} from 'semantic-ui-react';
import {H3} from 'sierra-frontend/dist/components/heading-tags';

import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import {useSeparateSuscResults} from '../hooks';

import PivotTableWrapper from './pivot-table-wrapper';


export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  hideNN = false,
  footnoteMean = false,
  suscResults,
  indivMutColumnDefs,
  indivMutGroupBy,
  comboMutsColumnDefs,
  comboMutsGroupBy
}) {

  const suscResultsBySection = useSeparateSuscResults({
    suscResults,
    skip: !loaded,
    aggFormDimension: false
  });

  const element = React.useMemo(
    () => {
      if (loaded) {
        const numSections = (
          Object.values(suscResultsBySection)
            .filter(({length = 0}) => length > 0)
            .length
        );
        const indivMutTable = (
          suscResultsBySection.indivMut.length > 0 ?
            <PivotTableWrapper
             id={`${id}_indiv-mut`}
             cacheKey={`${id}_indiv-mut_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={indivMutColumnDefs}
             groupBy={indivMutGroupBy}
             footnoteMean={footnoteMean}
             data={suscResultsBySection.indivMut} /> : null
        );
        const comboMutsTable = (
          suscResultsBySection.comboMuts.length > 0 ?
            <PivotTableWrapper
             id={`${id}_combo-muts`}
             cacheKey={`${id}_combo-muts_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={comboMutsColumnDefs}
             groupBy={comboMutsGroupBy}
             footnoteMean={footnoteMean}
             data={suscResultsBySection.comboMuts} /> : null
        );
        if (numSections === 2) {
          return <>
            <section>
              <Header as={H3} id={`${id}_indiv-mut`}>
                Individual mutation
              </Header>
              {indivMutTable}
            </section>
            <section>
              <Header as={H3} id={`${id}_combo-muts`}>
                Variant / mutation combination
              </Header>
              {comboMutsTable}
            </section>
          </>;
        }
        else if (numSections === 1) {
          return <>
            {indivMutTable}
            {comboMutsTable}
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
      loaded,
      suscResultsBySection,
      id,
      cacheKey,
      hideNN,
      indivMutColumnDefs,
      indivMutGroupBy,
      comboMutsColumnDefs,
      comboMutsGroupBy,
      footnoteMean
    ]
  );
  return element;
}
