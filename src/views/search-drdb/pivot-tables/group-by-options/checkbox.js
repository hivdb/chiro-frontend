import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';


GroupByCheckbox.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  columnDef: columnDefShape.isRequired
};


export default function GroupByCheckbox({
  idPrefix,
  checked,
  onChange,
  columnDef: {name, label}
}) {
  const handleChange = React.useCallback(
    evt => onChange(name, evt.currentTarget.checked),
    [name, onChange]
  );

  return <>
    <input
     id={`${idPrefix}_${name}`}
     type="checkbox"
     checked={checked}
     onChange={handleChange}
     value={name} />
    <label htmlFor={`${idPrefix}_${name}`}>
      {capitalize(label ? label : name)}
    </label>
  </>;
}
