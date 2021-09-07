import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import {Header} from 'semantic-ui-react';
import {H3} from 'sierra-frontend/dist/components/heading-tags';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';

import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import {useStatSuscResults, useSeparateSuscResults} from '../hooks';

import PivotTable from '../../../components/pivot-table';

import GroupByOptions from './group-by-options';
import style from './style.module.scss';


PivotTableWrapper.propTypes = {
  id: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
  data: PropTypes.array,
  groupBy: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  hideNN: PropTypes.bool,
  footnoteMean: PropTypes.bool,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired
};


function PivotTableWrapper({
  id,
  cacheKey,
  data,
  groupBy,
  hideNN = false,
  footnoteMean = false,
  columnDefs,
  ...props
}) {
  const [curGroupBy, setCurGroupBy] = React.useState(groupBy);
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
  const hasNN = !hide && numNoNatExps > 0;
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
  const filteredColumnDefs = React.useMemo(
    () => {
      const removeCols = groupBy.filter(name => !curGroupBy.includes(name));
      return columnDefs.filter(({name}) => !removeCols.includes(name));
    },
    [columnDefs, curGroupBy, groupBy]
  );

  const tableJSX = (
    numExps > 0 ?
      <PivotTable
       {...props}
       columnDefs={filteredColumnDefs}
       groupBy={curGroupBy}
       cacheKey={`${cacheKey}__${hide}__${JSON.stringify(curGroupBy)}`}
       data={data} /> : null
  );

  return <>
    <GroupByOptions
     idPrefix={id}
     onChange={setCurGroupBy}
     allColumnDefs={columnDefs}
     allGroupByOptions={groupBy}
     defaultGroupByOptions={groupBy} />
    {headNote}
    {tableJSX}
    {hasNA || hasNN || footnoteMean ? <p className={style.footnote}>
      {hasNA ? <>
        <strong><em>N.A.</em></strong>: data point not available
      </> : null}
      {hasNA && hasNN ? '; ' : null}
      {hasNN ? <>
        <strong><em>N.N.</em></strong>: control virus not neutralized
      </> : null}
      {(hasNA || hasNN) && footnoteMean ? '; ' : null}
      {footnoteMean ? <>
        <strong>GeoMean</strong>: geometric mean{'; '}
        <strong>GSD</strong>: geometric standard deviation{'; '}
        <strong>Mean</strong>: arithmetic mean{'; '}
        <strong>SD</strong>: arithmetic standard deviation
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
