import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import {Header} from 'semantic-ui-react';
import {H3, H4} from 'sierra-frontend/dist/components/heading-tags';

import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import {useStatSuscResults, useSeparateSuscResults} from '../hooks';

import PivotTable from './pivot-table';
import style from './style.module.scss';


SimpleTableWrapper.propTypes = {
  cacheKey: PropTypes.string.isRequired,
  data: PropTypes.array,
  hideNN: PropTypes.bool
};


function SimpleTableWrapper({cacheKey, data, hideNN = false, ...props}) {
  const [hide, setHide] = React.useState(hideNN);

  const handleUnhide = React.useCallback(
    evt => {
      evt.preventDefault();
      setHide(!hide);
    },
    [setHide, hide]
  );

  const filtered = data.filter(
    d => d.ineffective === 'experimental' || d.ineffective === null
  );
  const {numExps, numArticles, numNoNatExps} = useStatSuscResults(data);
  const hasNN = !hide && filtered.length > 0;
  const hasNA = data.some(d => (
    d.controlPotency === null || d.potency === null
  ));
  const headNote = <div>
    {numNoNatExps > 0 ? <>
      <em>
        Of the <strong>{numExps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('experiment result', numExps, false)}{' '}
        from <strong>{numArticles.toLocaleString('en-US')}</strong>{' '}
        {pluralize('study', numArticles, false)}{' '}
        listed in the following table,{' '}
        <strong>{numNoNatExps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('has', numNoNatExps)}{' '}
        {hide ? <>
          been hidden due to poor neutralizing
          activity against the control virus.
        </> : <>
          poor neutralizing activity against
          the control virus.
        </>}
      </em> (<a onClick={handleUnhide} href="#toggle-hide">
        {hide ? 'unhide' : 'hide'}
      </a>)
    </> : <em>
      The following table contains <strong>
        {numExps.toLocaleString('en-US')}</strong>{' '}
      {pluralize('experiment result', numExps, false)}{' '}
      from <strong>{numArticles.toLocaleString('en-US')}</strong>{' '}
      {pluralize('study', numArticles, false)}.
    </em>}
  </div>;
  if (hide) {
    data = filtered;
  }

  const tableJSX = (
    numExps > 0 ?
      <SimpleTable
       {...props}
       cacheKey={`${cacheKey}__${hide}`}
       data={data} /> : null
  );

  return <>
    {headNote}
    {tableJSX}
    {hasNA || hasNN ? <p className={style.footnote}>
      {hasNA ? <>
        <strong><em>N.A.</em></strong>: data point not available
      </> : null}
      {hasNA && hasNN ? '; ' : null}
      {hasNN ? <>
        <strong><em>N.N.</em></strong>: control virus not neutralized
      </> : null}
      .
    </p> : null}
  </>;
}

export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  hideNN = false,
  suscResults,
  indivMutIndivFoldColumnDefs,
  indivMutAggFoldColumnDefs,
  comboMutsIndivFoldColumnDefs,
  comboMutsAggFoldColumnDefs
}) {

  const suscResultsBySection = useSeparateSuscResults({
    suscResults,
    skip: !loaded
  });

  const element = React.useMemo(
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
            <PivotTable
             cacheKey={`${id}_indiv-mut_indiv-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={indivMutIndivFoldColumnDefs}
             data={suscResultsBySection.indivMut.indivFold} /> : null
        );
        const indivMutAggFoldTable = (
          suscResultsBySection.indivMut.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_indiv-mut_agg-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={indivMutAggFoldColumnDefs}
             data={suscResultsBySection.indivMut.aggFold} /> : null
        );
        const comboMutsIndivFoldTable = (
          suscResultsBySection.comboMuts.indivFold.length > 0 ?
            <PivotTable
             cacheKey={`${id}_combo-muts_indiv-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={comboMutsIndivFoldColumnDefs}
             data={suscResultsBySection.comboMuts.indivFold} /> : null
        );
        const comboMutsAggFoldTable = (
          suscResultsBySection.comboMuts.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_combo-muts_agg-fold_${cacheKey}`}
             hideNN={hideNN}
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
      loaded,
      suscResultsBySection,
      id,
      cacheKey,
      hideNN,
      indivMutIndivFoldColumnDefs,
      indivMutAggFoldColumnDefs,
      comboMutsIndivFoldColumnDefs,
      comboMutsAggFoldColumnDefs
    ]
  );
  return element;
}
