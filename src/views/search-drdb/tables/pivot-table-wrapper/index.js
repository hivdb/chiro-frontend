import React from 'react';
import PropTypes from 'prop-types';
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
  ),
  hideNN: PropTypes.bool,
  footnoteMean: PropTypes.bool,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired
};


function cleanGroupBy(groupBy) {
  groupBy = [...groupBy];
  if (
    groupBy.includes('isoAggkey') &&
    !groupBy.includes('numMutations')
  ) {
    groupBy.push('numMutations');
  }
  else if (
    !groupBy.includes('isoAggkey') &&
    groupBy.includes('numMutations')
  ) {
    groupBy = groupBy.filter(key => key !== 'numMutations');
  }
  return groupBy.sort();
}


export default function PivotTableWrapper({
  id,
  cacheKey,
  data,
  groupBy,
  hideNN = false,
  footnoteMean = false,
  columnDefs,
  ...props
}) {
  const pivotTableCtlRef = React.useRef();
  const [curGroupBy, setCurGroupBy] = React.useState(groupBy);
  const [hide, setHide] = React.useState(hideNN);

  const setLoading = React.useCallback(
    callback => {
      pivotTableCtlRef.current.dataset.loading = '';
      setTimeout(() => {
        callback();
        setTimeout(() => {
          delete pivotTableCtlRef.current.dataset.loading;
        }, 0);
      }, 0);
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
    [setLoading, hide]
  );

  const {numExps, numArticles, numNoNatExps} = useStatSuscResults(data);
  const hasNN = !hide && numNoNatExps > 0;
  const hasNA = data.some(d => (
    d.controlPotency === null || d.potency === null
  ));

  const filteredColumnDefs = React.useMemo(
    () => {
      const removeCols = groupBy.filter(name => !curGroupBy.includes(name));
      if (removeCols.includes('refName')) {
        removeCols.push('section');
      }
      else {
        removeCols.push('numStudies');
      }
      return columnDefs.filter(({name}) => !removeCols.includes(name));
    },
    [columnDefs, curGroupBy, groupBy]
  );

  const tableData = React.useMemo(
    () => (
      hide ? data.filter(
        d => d.ineffective === 'experimental' || d.ineffective === null
      ) : data
    ),
    [data, hide]
  );

  const cleanedGroupBy = React.useMemo(
    () => cleanGroupBy(curGroupBy),
    [curGroupBy]
  );

  const aggData = useAggregateData({
    data: tableData,
    groupBy: cleanedGroupBy,
    columnDefs: filteredColumnDefs
  });
  const numRows = aggData.length;

  return <>
    <GroupByOptions
     idPrefix={id}
     onChange={handleChangeGroupBy}
     allColumnDefs={columnDefs}
     allGroupByOptions={groupBy}
     defaultGroupByOptions={groupBy} />
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
         columnDefs={filteredColumnDefs}
         cacheKey={`${cacheKey}__${hide}__${JSON.stringify(cleanedGroupBy)}`}
         data={aggData} />
      </div> : null}
    <FootNote hasNA={hasNA} hasNN={hasNN} footnoteMean={footnoteMean} />
  </>;
}
