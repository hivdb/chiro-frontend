import React from 'react';
import PropTypes from 'prop-types';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';

import Checkbox from './checkbox';


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
  const [
    groupByOptionMap,
    setGroupByOptionMap
  ] = React.useState(defaultGroupByOptionMap);

  const handleChange = React.useCallback(
    (name, checked) => {
      const newOptMap = {...groupByOptionMap};
      newOptMap[name] = checked;
      setGroupByOptionMap(newOptMap);
      setTimeout(
        () => onChange(
          Object
            .entries(newOptMap)
            .filter(([, keep]) => keep)
            .map(([name]) => name)
        ),
        0
      );
    },
    [groupByOptionMap, onChange]
  );

  return <ul>
    {columnDefs.map(
      colDef => <li key={colDef.name}>
        <Checkbox
         idPrefix={idPrefix}
         columnDef={colDef}
         checked={groupByOptionMap[colDef.name]}
         onChange={handleChange} />
      </li>
    )}
  </ul>;
}
