import React from 'react';
import {useRouter} from 'found';
import {H3} from 'sierra-frontend/dist/components/heading-tags';

import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import {useSeparateSuscResults} from '../hooks';

import PivotTableWrapper from './pivot-table-wrapper';


export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  hideNN = true,
  hideNon50 = true,
  footnoteMean = false,
  suscResults,
  allTableConfig
}) {

  const {router} = useRouter();

  const suscResultsBySection = useSeparateSuscResults({
    suscResults,
    skip: !loaded,
    dimensions: ['isoType']
  });

  const handleGoBack = React.useCallback(
    e => {
      e && e.preventDefault();
      router.go(-1);
    },
    [router]
  );

  const element = React.useMemo(
    () => {
      if (loaded) {
        const numSections = (
          Object.values(suscResultsBySection)
            .filter(({length = 0}) => length > 0)
            .length
        );
        const indivMutTable = (
          suscResultsBySection.indivMut?.length > 0 ?
            <PivotTableWrapper
             id={`${id}_indiv-mut`}
             cacheKey={`${id}_indiv-mut_${cacheKey}`}
             hideNN={hideNN}
             hideNon50={hideNon50}
             tableConfig={allTableConfig.indivMut}
             footnoteMean={footnoteMean}
             data={suscResultsBySection.indivMut} /> : null
        );
        const comboMutsTable = (
          suscResultsBySection.comboMuts?.length > 0 ?
            <PivotTableWrapper
             id={`${id}_combo-muts`}
             cacheKey={`${id}_combo-muts_${cacheKey}`}
             hideNN={hideNN}
             hideNon50={hideNon50}
             tableConfig={allTableConfig.comboMuts}
             footnoteMean={footnoteMean}
             data={suscResultsBySection.comboMuts} /> : null
        );
        if (numSections === 2) {
          return <>
            <section>
              <H3 id={`${id}_indiv-mut`}>
                Individual mutation
              </H3>
              {indivMutTable}
            </section>
            <section>
              <H3 id={`${id}_combo-muts`}>
                Variant / mutation combination
              </H3>
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
          return <>
            <div>
              No susceptibility data is found for this request.
              (<a href="#back" onClick={handleGoBack}>Go back</a>)
            </div>
          </>;
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
      hideNon50,
      allTableConfig,
      footnoteMean,
      handleGoBack
    ]
  );
  return element;
}
