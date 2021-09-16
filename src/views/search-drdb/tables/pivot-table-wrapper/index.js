import React from 'react';
import PropTypes from 'prop-types';
import union from 'lodash/union';
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import createPersistedState from 'use-persisted-state/src';

import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';
import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';

import {useAggregateData} from '../../../../components/pivot-table';

import {useStatSuscResults} from '../../hooks';
import GroupByOptions from '../group-by-options';

import HeadNote from './headnote';
import FootNote from './footnote';

import style from './style.module.scss';


PivotTableWrapper.propTypes = {
  id: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
  data: PropTypes.array,
  groupBy: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  defaultGroupBy: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  hideNN: PropTypes.bool,
  footnoteMean: PropTypes.bool,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired
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
  groupBy,
  defaultGroupBy,
  hideNN = true,
  footnoteMean = false,
  columnDefs,
  ...props
}) {
  const pivotTableCtlRef = React.useRef();
  const [curGroupBy, setCurGroupBy] = React.useState(defaultGroupBy);

  const useHideState = createPersistedState(
    `${id}__hideState`
  );
  const [
    hide,
    setHide
  ] = useHideState(hideNN);

  const setLoading = React.useCallback(
    callback => {
      const target = pivotTableCtlRef.current;
      if (target) {
        target.dataset.loading = '';
        setTimeout(() => {
          callback();
          setTimeout(() => {
            delete target.dataset.loading;
          }, 0);
        }, 0);
      }
    },
    []
  );

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
        () => setHide(!hide)
      );
    },
    [setLoading, setHide, hide]
  );

  const {numExps, numArticles, numNoNatExps} = useStatSuscResults(data);
  const hasNN = !hide && numNoNatExps > 0;
  const hasNA = data.some(d => (
    d.controlPotency === null || d.potency === null
  ));

  const tableData = React.useMemo(
    () => (
      hide ? data.filter(
        d => d.ineffective === 'experimental' || d.ineffective === null
      ) : data
    ),
    [data, hide]
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
     defaultGroupByOptions={defaultGroupBy} />
    <HeadNote
     numRows={numRows}
     numExps={numExps}
     numArticles={numArticles}
     numNoNatExps={numNoNatExps}
     hideNN={hide}
     onToggleHideNN={handleToggleHideNN} />
    {numExps > 0 ?
      <div ref={pivotTableCtlRef} className={style['pivot-table-control']}>
        <InlineLoader className={style['loader']} />
        <SimpleTable
         {...props}
         className={style['pivot-table']}
         columnDefs={cleanedColumnDefs}
         cacheKey={`${cacheKey}__${hide}__${JSON.stringify(cleanedGroupBy)}`}
         data={aggData} />
      </div> : null}
    <FootNote hasNA={hasNA} hasNN={hasNN} footnoteMean={footnoteMean} />
  </>;
}
