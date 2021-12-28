import React from 'react';
import PropTypes from 'prop-types';
import union from 'lodash/union';
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import createPersistedState from 'use-persisted-state/src';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';

import {useSetLoading} from '../../../../utils/set-loading';
import {useAggregateData} from '../../../../components/pivot-table';

import {useStatSuscResults} from '../../hooks';
import LocationParams from '../../hooks/location-params';
import GroupByOptions from '../group-by-options';

import useColumnDefs from '../column-defs';
import {aggGeoMeanWeighted} from '../column-defs/agg-funcs';

import ModalContext from './modal-context';
import RawSuscResults from './raw-susc-results';
import HeadNote from './headnote';
import FootNote from './footnote';

import style from './style.module.scss';

export {ModalContext};


PivotTableWrapper.propTypes = {
  id: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
  data: PropTypes.array,
  hideNN: PropTypes.bool,
  hideNon50: PropTypes.bool,
  footnoteMean: PropTypes.bool,
  tableConfig: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    labels: PropTypes.objectOf(
      PropTypes.node.isRequired
    ).isRequired,
    groupBy: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    defaultGroupBy: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ),
    subfilterOptions: PropTypes.objectOf(
      PropTypes.array.isRequired
    )
  }).isRequired
};


function useCleanGroupBy(curGroupBy, validOptions) {
  return React.useMemo(
    () => {
      let groupBy = intersection(curGroupBy, validOptions);
      if (groupBy.includes('isoAggkey')) {
        groupBy = union(groupBy, ['numMutations']);
      }
      else {
        groupBy = difference(groupBy, ['numMutations']);
      }
      return groupBy.sort();
    },
    [curGroupBy, validOptions]
  );
}


function useCleanColumnDefs(columnDefs, curGroupBy, validOptions) {
  return React.useMemo(
    () => {
      const removeCols = difference(validOptions, curGroupBy);
      if (removeCols.includes('refName')) {
        removeCols.push('section');
      }
      else {
        removeCols.push('numStudies');
      }
      return columnDefs.filter(({name}) => !removeCols.includes(name));
    },
    [columnDefs, curGroupBy, validOptions]
  );
}


export default function PivotTableWrapper({
  id,
  cacheKey,
  data,
  tableConfig,
  tableConfig: {
    columns,
    labels,
    groupBy,
    defaultGroupBy,
    subfilterOptions
  },
  hideNN: defaultHideNN = true,
  hideNon50: defaultHideNon50 = true,
  footnoteMean = false,
  ...props
}) {
  const pivotTableCtlRef = React.useRef();
  const [modalData, setModalData] = React.useState(null);
  const {params: {debugMsg}} = LocationParams.useMe();
  const [curGroupBy, setCurGroupBy] = React.useState(defaultGroupBy || groupBy);

  const columnDefs = useColumnDefs({columns, labels});

  const useHideNNState = createPersistedState(
    `${id}__hideNNState`
  );
  const [
    hideNN,
    setHideNN
  ] = useHideNNState(defaultHideNN);
  const debugOnlyNN = /\bonlyNN\b/.test(debugMsg);

  const useHideNon50State = createPersistedState(
    `${id}__hideNon50State`
  );
  const [
    hideNon50,
    setHideNon50
  ] = useHideNon50State(defaultHideNon50);

  const handleModalClose = React.useCallback(() => setModalData(null), []);
  const setLoading = useSetLoading(pivotTableCtlRef);

  const handleChangeGroupBy = React.useCallback(
    newGroupBy => setLoading(
      () => setCurGroupBy(newGroupBy)
    ),
    [setLoading]
  );

  const handleToggleHideNN = React.useCallback(
    evt => {
      evt.preventDefault();
      setLoading(
        () => setHideNN(!hideNN)
      );
    },
    [setLoading, setHideNN, hideNN]
  );

  const handleToggleHideNon50 = React.useCallback(
    evt => {
      evt.preventDefault();
      setLoading(
        () => setHideNon50(!hideNon50)
      );
    },
    [setLoading, setHideNon50, hideNon50]
  );

  const {
    numExps,
    numArticles,
    numNoNatExps,
    numNon50Exps
  } = useStatSuscResults(data);
  const hasNN = !hideNN && numNoNatExps > 0;
  const hasNA = data.some(d => (
    d.controlPotency === null || d.potency === null
  ));

  const mainPotencyType = (
    data.some(({rxType}) => rxType === 'antibody') ? 'IC50' : 'NT50'
  );

  const tableData = React.useMemo(
    () => data
      .filter(
        d => (
          debugOnlyNN ? (
            d.ineffective !== 'experimental' &&
            d.ineffective !== null
          ) : (
            !hideNN ||
            d.ineffective === 'experimental' ||
            d.ineffective === null
          )
        )
      )
      .filter(d => !hideNon50 || d.potencyType === mainPotencyType)
      .map(row => {
        // hideNN for unlinked potency data.
        // Since the potency data are unlinked, we need to also hide the same
        // or less amount of ineffective expPotency data to "balance" the lose
        // of ineffective ctlPotency. In another words, if we hide n control
        // potency data, we also hide ≤n target potency data.
        if (
          !row.unlinkedControlPotency ||
          row.unlinkedControlPotency.length === 0
        ) {
          return row;
        }
        let {fold, ineffective, potencyType: potType} = row;

        const theHigherTheMoreEffective = (
          potType.startsWith('NT') || potType.startsWith('NC')
        );

        const findThreshold = theHigherTheMoreEffective ? Math.max : Math.min;

        const ctlPotThreshold = findThreshold(
          ...row.unlinkedControlPotency
            .filter(d => d.ineffective)
            .map(d => d.potency)
        );

        const potThreshold = findThreshold(
          ...row.unlinkedPotency
            .filter(d => d.ineffective)
            .map(d => d.potency)
        );

        const filterredUnCtlPot = row.unlinkedControlPotency.filter(
          d => !hideNN || !d.ineffective
        );
        let hideIneffUnPotAllowance = (
          row.unlinkedControlPotency.length - filterredUnCtlPot.length
        );
        const filterredUnPot = row.unlinkedPotency.filter(
          d => !hideNN || !d.ineffective || (hideIneffUnPotAllowance --) <= 0
        );
        const controlCumulativeCount = filterredUnCtlPot.reduce(
          (acc, {cumulativeCount}) => acc + cumulativeCount,
          0
        );
        const cumulativeCount = filterredUnPot.reduce(
          (acc, {cumulativeCount}) => acc + cumulativeCount,
          0
        );
        if (controlCumulativeCount > 0 && cumulativeCount > 0) {
          const finalCtlPot = aggGeoMeanWeighted(
            filterredUnCtlPot.map(({potency}) => potency),
            filterredUnCtlPot.map(({cumulativeCount}) => cumulativeCount)
          );
          const finalPot = aggGeoMeanWeighted(
            filterredUnPot.map(({potency}) => potency),
            filterredUnPot.map(({cumulativeCount}) => cumulativeCount)
          );
          if (theHigherTheMoreEffective) {
            // for NT/NC
            fold = finalCtlPot / finalPot;
            // relative to #38, floating quirks
            if (finalCtlPot <= ctlPotThreshold + 1e-4) {
              ineffective = 'control';
            }
            if (finalPot <= potThreshold) {
            // relative to #38, floating quirks
              if (ineffective === 'control' + 1e-4) {
                ineffective = 'both';
              }
              else {
                ineffective = 'experimental';
              }
            }
          }
          else {
            // for IC
            fold = finalPot / finalCtlPot;
            // relative to #38, floating quirks
            if (finalCtlPot >= ctlPotThreshold - 1e-4) {
              ineffective = 'control';
            }
            // relative to #38, floating quirks
            if (finalPot >= potThreshold - 1e-4) {
              if (ineffective === 'control') {
                ineffective = 'both';
              }
              else {
                ineffective = 'experimental';
              }
            }
          }
        }
        return {
          ...row,
          unlinkedControlPotency: filterredUnCtlPot,
          unlinkedPotency: filterredUnPot,
          ineffective,
          fold,
          controlCumulativeCount,
          cumulativeCount
        };
      })
      .filter(({controlCumulativeCount, cumulativeCount}) => (
        controlCumulativeCount > 0 && cumulativeCount > 0
      )),
    [data, debugOnlyNN, hideNN, hideNon50, mainPotencyType]
  );
  const cleanedGroupBy = useCleanGroupBy(curGroupBy, groupBy);
  const cleanedColumnDefs = useCleanColumnDefs(columnDefs, curGroupBy, groupBy);

  const aggData = useAggregateData({
    data: tableData,
    groupBy: cleanedGroupBy,
    columnDefs: cleanedColumnDefs
  });
  const numRows = aggData.length;

  return <>
    <GroupByOptions
     idPrefix={id}
     onChange={handleChangeGroupBy}
     allColumnDefs={columnDefs}
     allGroupByOptions={groupBy}
     defaultGroupByOptions={defaultGroupBy || groupBy}
     subfilterOptions={subfilterOptions} />
    <HeadNote
     numRows={numRows}
     numExps={numExps}
     numArticles={numArticles}
     numNoNatExps={numNoNatExps}
     numNon50Exps={numNon50Exps}
     hideNN={hideNN}
     debugOnlyNN={debugOnlyNN}
     hideNon50={hideNon50}
     mainPotencyType={mainPotencyType}
     onToggleHideNN={handleToggleHideNN}
     onToggleHideNon50={handleToggleHideNon50} />
    {numExps > 0 ?
      <div ref={pivotTableCtlRef} className={style['pivot-table-control']}>
        <InlineLoader className={style['loader']} />
        <ModalContext.Provider value={{setData: setModalData}}>
          <SimpleTable
           {...props}
           className={style['pivot-table']}
           columnDefs={cleanedColumnDefs}
           cacheKey={`${cacheKey}__${hideNN}__${hideNon50}__${
             JSON.stringify(cleanedGroupBy)
           }`}
           data={aggData} />
          {modalData === null ? null : (
            <RawSuscResults
             data={modalData}
             tableConfig={tableConfig}
             onClose={handleModalClose} />
          )}
        </ModalContext.Provider>
      </div> : null}
    <FootNote hasNA={hasNA} hasNN={hasNN} footnoteMean={footnoteMean} />
  </>;
}
