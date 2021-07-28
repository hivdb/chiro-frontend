import React from 'react';
import pluralize from 'pluralize';
import {Header} from 'semantic-ui-react';
import {H3, H4} from 'sierra-frontend/dist/components/heading-tags';

import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';


const type2Section = {
  'individual-mutation': 'indivMut',
  'named-variant': 'comboMuts',
  'mutation-combination': 'comboMuts'
};


function SimpleTableWrapper({data, ...props}) {
  const filtered = data.filter(
    d => d.ineffective === 'experimental' || d.ineffective === null
  );
  const removedLen = data.length - filtered.length;

  const tableJSX = (
    filtered.length > 0 ?
      <SimpleTable {...props} data={filtered} /> : null
  );

  const hideNote = (
    removedLen > 0 ?
      <div><em>
        <strong>{pluralize('result', removedLen, true)}</strong>{' '}
        {pluralize('has', removedLen)}{' '}
        been removed from the below table due to poor
        neutralizing response against the control virus.
      </em></div> : null
  );

  return <>
    {hideNote}
    {tableJSX}
  </>;
}



export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  suscResults,
  isolateLookup,
  indivMutIndivFoldColumnDefs,
  indivMutAggFoldColumnDefs,
  comboMutsIndivFoldColumnDefs,
  comboMutsAggFoldColumnDefs
}) {

  const suscResultsBySection = React.useMemo(
    () => {
      if (!loaded) {
        return;
      }
      return suscResults.reduce(
        (acc, sr) => {
          const {type} = isolateLookup[sr.isoName];
          const section = type2Section[type];
          if (sr.cumulativeCount > 1) {
            acc[section].aggFold.push(sr);
          }
          else {
            acc[section].indivFold.push(sr);
          }
          return acc;
        },
        {
          indivMut: {indivFold: [], aggFold: []},
          comboMuts: {indivFold: [], aggFold: []}
        }
      );
    },
    [loaded, suscResults, isolateLookup]
  );



  return React.useMemo(
    () => {
      if (loaded) {
        const numSections = (
          Object.entries(suscResultsBySection)
            .filter(
              ([, {indivFold, aggFold}]) => (
                indivFold.length + aggFold.length > 0
              )
            )
            .length
        );
        const indivMutIndivFoldTable = (
          suscResultsBySection.indivMut.indivFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_indiv-mut_indiv-fold_${cacheKey}`}
             columnDefs={indivMutIndivFoldColumnDefs}
             data={suscResultsBySection.indivMut.indivFold} /> : null
        );
        const indivMutAggFoldTable = (
          suscResultsBySection.indivMut.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_indiv-mut_agg-fold_${cacheKey}`}
             columnDefs={indivMutAggFoldColumnDefs}
             data={suscResultsBySection.indivMut.aggFold} /> : null
        );
        const comboMutsIndivFoldTable = (
          suscResultsBySection.comboMuts.indivFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_combo-muts_indiv-fold_${cacheKey}`}
             columnDefs={comboMutsIndivFoldColumnDefs}
             data={suscResultsBySection.comboMuts.indivFold} /> : null
        );
        const comboMutsAggFoldTable = (
          suscResultsBySection.comboMuts.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_combo-muts_agg-fold_${cacheKey}`}
             columnDefs={comboMutsAggFoldColumnDefs}
             data={suscResultsBySection.comboMuts.aggFold} /> : null
        );
        if (numSections === 2) {
          return <>
            <section>
              <Header as={H3} id={`${id}_indiv-mut`}>
                Individual mutation
                {indivMutIndivFoldTable ?
                  null : ' - data published only in aggregate form'}
              </Header>
              {indivMutIndivFoldTable}
              {indivMutIndivFoldTable && indivMutAggFoldTable ? <>
                <Header as={H4} id={`${id}_indiv-mut_agg-fold`}>
                  Individual mutation -
                  data published only in aggregate form
                </Header>
              </> : null}
              {indivMutAggFoldTable}
            </section>
            <section>
              <Header as={H3} id={`${id}_combo-muts`}>
                Variant / mutation combination
                {comboMutsIndivFoldTable ?
                  null : ' - data published only in aggregate form'}
              </Header>
              {comboMutsIndivFoldTable}
              {comboMutsIndivFoldTable && comboMutsAggFoldTable ? <>
                <Header as={H4} id={`${id}_combo-muts_agg-fold`}>
                  Variant / mutation combination -
                  data published only in aggregate form
                </Header>
              </> : null}
              {comboMutsAggFoldTable}
            </section>
          </>;
        }
        else if (numSections === 1) {
          return <>
            {indivMutIndivFoldTable}
            {indivMutAggFoldTable ? <>
              <Header as={H3} id={`${id}_indiv-mut_agg-fold`}>
                Data published only in aggregate form
              </Header>
              {indivMutAggFoldTable}
            </> : null}
            {comboMutsIndivFoldTable}
            {comboMutsAggFoldTable ? <>
              <Header as={H3} id={`${id}_combo-muts_agg-fold`}>
                Data published only in aggregate form
              </Header>
              {comboMutsAggFoldTable}
            </> : null}
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
      indivMutIndivFoldColumnDefs,
      indivMutAggFoldColumnDefs,
      comboMutsIndivFoldColumnDefs,
      comboMutsAggFoldColumnDefs,
      suscResultsBySection
    ]
  );
}
