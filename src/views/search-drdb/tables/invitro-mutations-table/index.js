import React from 'react';
import {useRouter} from 'found';
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';

import {useSetLoading} from '../../../../utils/set-loading';
import {useAggregateData} from '../../../../components/pivot-table';

import InVitroMutations from '../../hooks/invitro-mutations';
import LocationParams from '../../hooks/location-params';

import GroupByOptions from '../group-by-options';
import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'section',
    'abNames',
    'numStudies',
    'inVitroMut'
  ],
  labels: {},
  groupBy: [
    'refName',
    'abNames',
    'inVitroMut'
  ]
};

function useCleanGroupBy(curGroupBy, validOptions) {
  return React.useMemo(
    () => {
      let groupBy = intersection(curGroupBy, validOptions);
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

export default function InVitroMutationsTable() {
  let {columns, labels, groupBy, defaultGroupBy} = tableConfig;

  const {
    params: {
      refName,
      varName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const tableCtlRef = React.useRef();
  const setLoading = useSetLoading(tableCtlRef);

  const [curGroupBy, setCurGroupBy] = React.useState(
    defaultGroupBy || groupBy
  );

  const {router} = useRouter();
  const handleGoBack = React.useCallback(
    e => {
      e && e.preventDefault();
      router.go(-1);
    },
    [router]
  );

  const {inVitroMuts, isPending} = InVitroMutations.useMe();
  const columnDefs = useColumnDefs({
    columns,
    labels
  });

  const handleChangeGroupBy = React.useCallback(
    newGroupBy => setLoading(
      () => setCurGroupBy(newGroupBy)
    ),
    [setLoading]
  );

  const cleanedGroupBy = useCleanGroupBy(curGroupBy, groupBy);
  const cleanedColumnDefs = useCleanColumnDefs(columnDefs, curGroupBy, groupBy);

  const aggData = useAggregateData({
    data: inVitroMuts,
    groupBy: cleanedGroupBy,
    columnDefs: cleanedColumnDefs,
    skip: isPending
  });

  if (isPending) {
    return null;
  }

  if (aggData.length === 0) {
    return <>
      <div>
        No in-vitro selection data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }

  const cacheKey = JSON.stringify({
    refName,
    varName,
    isoAggkey,
    abNames,
    cleanedGroupBy
  });
  return <>
    <GroupByOptions
     idPrefix="invitro-mutations"
     onChange={handleChangeGroupBy}
     allColumnDefs={columnDefs}
     allGroupByOptions={groupBy}
     defaultGroupByOptions={defaultGroupBy || groupBy} />
    <br />
    <div ref={tableCtlRef} className={style['invitro-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       className={style['invitro-muts-table']}
       columnDefs={cleanedColumnDefs}
       cacheKey={cacheKey}
       data={aggData} />
    </div>
  </>;
}
