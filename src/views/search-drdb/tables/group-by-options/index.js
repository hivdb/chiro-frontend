import React from 'react';
import PropTypes from 'prop-types';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';
import createPersistedState from 'use-persisted-state/src';

import Checkbox from './checkbox';

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
  onChange: PropTypes.func
};


export default function GroupByOptions({
  idPrefix,
  allColumnDefs,
  allGroupByOptions,
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
    `${idPrefix}v${STATE_VERSION}`
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
          </li>
        )
      )}
    </ul>
  </div>;
}
