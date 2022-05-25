import React from 'react';
import PropTypes from 'prop-types';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';
import createPersistedState from 'use-persisted-state/src';

import Checkbox from './checkbox';
import Subfilter, {useResetAllSubfilters} from './subfilter';

import style from './style.module.scss';

const STATE_VERSION = 3;


function groupByOptionMapToArray(optMap) {
  return Object
    .entries(optMap)
    .filter(([, keep]) => keep)
    .map(([name]) => name);
}


function useGroupByOptionMap({
  allGroupByOptions,
  curGroupByOptions
}) {
  const curOptMap = React.useMemo(
    () => allGroupByOptions.reduce(
      (acc, name) => {
        acc[name] = curGroupByOptions.includes(name);
        return acc;
      },
      {}
    ),
    [allGroupByOptions, curGroupByOptions]
  );
  return curOptMap;
}


export function usePersistedGroupByOptions({
  idPrefix,
  defaultGroupByOptions
}) {
  const useOpts = createPersistedState(
    `${idPrefix}__dimensions__v${STATE_VERSION}`
  );
  const [opts, setOpts] = useOpts(defaultGroupByOptions);
  return [opts, setOpts];
}


GroupByOptions.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  allColumnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired,
  allGroupByOptions: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  curGroupByOptions: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  subfilterOptions: PropTypes.objectOf(
    PropTypes.array.isRequired
  ),
  onChange: PropTypes.func,
  onReset: PropTypes.func
};


export default function GroupByOptions({
  idPrefix,
  allColumnDefs,
  allGroupByOptions,
  curGroupByOptions,
  subfilterOptions = {},
  onChange,
  onReset
}) {
  const columnDefs = React.useMemo(
    () => allColumnDefs.filter(
      ({name}) => allGroupByOptions.includes(name)
    ),
    [allColumnDefs, allGroupByOptions]
  );

  const groupByOptionMap = useGroupByOptionMap({
    allGroupByOptions,
    curGroupByOptions
  });

  const handleChange = React.useCallback(
    (name, checked) => {
      const newOptMap = {...groupByOptionMap};
      newOptMap[name] = checked;
      onChange && onChange(groupByOptionMapToArray(newOptMap));
    },
    [groupByOptionMap, onChange]
  );

  const allChecked = React.useMemo(
    () => (
      columnDefs.every(({name}) => groupByOptionMap[name])
    ),
    [groupByOptionMap, columnDefs]
  );

  const handleCheckAll = React.useCallback(
    e => {
      e && e.preventDefault();
      const options = allChecked ? [] : [...allGroupByOptions];
      onChange && onChange(options);
    },
    [allGroupByOptions, onChange, allChecked]
  );
  const onResetAllSubfilters = useResetAllSubfilters(subfilterOptions);

  const handleReset = React.useCallback(
    e => {
      e && e.preventDefault();
      onReset && onReset();
      onResetAllSubfilters();
    },
    [
      onReset,
      onResetAllSubfilters
    ]
  );

  return <div className={style['group-by-options_container']}>
    <label className={style['group-by-options_label']}>
      Table dimensions:
    </label>
    <ul className={style['group-by-options']}>
      {columnDefs.map(
        colDef => (
          <li
           key={colDef.name}
           data-checked={!!groupByOptionMap[colDef.name]}>
            <Checkbox
             idPrefix={idPrefix}
             columnDef={colDef}
             checked={!!groupByOptionMap[colDef.name]}
             onChange={handleChange} />
            {subfilterOptions[colDef.name] ?
              <Subfilter options={subfilterOptions[colDef.name]} /> :
              null}
          </li>
        )
      )}
      <li>
        (
        <a href="#check-all" onClick={handleCheckAll}>
          {allChecked ? 'Deselect all' : 'Select all'}
        </a>
        {' · '}
        <a href="#reset" onClick={handleReset}>Reset</a>
        )
      </li>
    </ul>
  </div>;
}
