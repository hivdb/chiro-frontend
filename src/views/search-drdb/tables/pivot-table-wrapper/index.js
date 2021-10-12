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
import GroupByOptions from '../group-by-options';

import useColumnDefs from '../column-defs';
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
  const [curGroupBy, setCurGroupBy] = React.useState(defaultGroupBy || groupBy);

  const columnDefs = useColumnDefs({columns, labels});

  const useHideNNState = createPersistedState(
    `${id}__hideNNState`
  );
  const [
    hideNN,
    setHideNN
  ] = useHideNNState(defaultHideNN);

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
          !hideNN ||
          d.ineffective === 'experimental' ||
          d.ineffective === null
        )
      )
      .filter(d => !hideNon50 || d.potencyType === mainPotencyType),
    [data, hideNN, hideNon50, mainPotencyType]
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
