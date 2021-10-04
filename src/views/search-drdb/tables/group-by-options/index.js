import React from 'react';
import PropTypes from 'prop-types';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';
import createPersistedState from 'use-persisted-state/src';

import Checkbox from './checkbox';
import Subfilter, {useResetAllSubfilters} from './subfilter';

import style from './style.module.scss';

const STATE_VERSION = 2;


GroupByOptions.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  allColumnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired,
  allGroupByOptions: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  defaultGroupByOptions: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  subfilterOptions: PropTypes.objectOf(
    PropTypes.array.isRequired
  ),
  onChange: PropTypes.func
};


export default function GroupByOptions({
  idPrefix,
  allColumnDefs,
  allGroupByOptions,
  subfilterOptions = {},
  defaultGroupByOptions,
  onChange
}) {
  const defaultGroupByOptionMap = React.useMemo(
    () => defaultGroupByOptions.reduce(
      (acc, name) => {
        acc[name] = true;
        return acc;
      },
      {}
    ),
    [defaultGroupByOptions]
  );
  const columnDefs = React.useMemo(
    () => allColumnDefs.filter(
      ({name}) => allGroupByOptions.includes(name)
    ),
    [allColumnDefs, allGroupByOptions]
  );
  const useGroupByOptionMap = createPersistedState(
    `${idPrefix}__dimensions__v${STATE_VERSION}`
  );
  const [
    groupByOptionMap,
    setGroupByOptionMap
  ] = useGroupByOptionMap(defaultGroupByOptionMap);

  React.useEffect(
    () => {
      if (groupByOptionMap !== defaultGroupByOptionMap) {
        onChange && onChange(
          Object
            .entries(groupByOptionMap)
            .filter(([, keep]) => keep)
            .map(([name]) => name)
        );
      }
    },
    [groupByOptionMap, defaultGroupByOptionMap, onChange]
  );

  const handleChange = React.useCallback(
    (name, checked) => {
      const newOptMap = {...groupByOptionMap};
      newOptMap[name] = checked;
      setGroupByOptionMap(newOptMap);
      onChange && onChange(
        Object
          .entries(newOptMap)
          .filter(([, keep]) => keep)
          .map(([name]) => name)
      );
    },
    [groupByOptionMap, onChange, setGroupByOptionMap]
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
      const options = allChecked ? [] : columnDefs.map(({name}) => name);
      setGroupByOptionMap(options.reduce(
        (acc, name) => {
          acc[name] = true;
          return acc;
        },
        {}
      ));
      onChange && onChange(options);
    },
    [columnDefs, setGroupByOptionMap, onChange, allChecked]
  );
  const onResetAllSubfilters = useResetAllSubfilters(subfilterOptions);

  const handleReset = React.useCallback(
    e => {
      e && e.preventDefault();
      setGroupByOptionMap(defaultGroupByOptionMap);
      onChange && onChange(defaultGroupByOptions);
      onResetAllSubfilters();
    },
    [
      defaultGroupByOptionMap,
      defaultGroupByOptions,
      onChange,
      setGroupByOptionMap,
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
