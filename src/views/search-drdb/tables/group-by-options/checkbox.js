import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import {
  columnDefShape
} from 'sierra-frontend/dist/components/simple-table/prop-types';
import CheckboxInput from 'sierra-frontend/dist/components/checkbox-input';


CheckAllBox.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export function CheckAllBox({
  idPrefix,
  checked,
  onChange
}) {
  const handleChange = React.useCallback(
    evt => onChange(evt.currentTarget.checked),
    [onChange]
  );

  return <>
    <CheckboxInput
     id={`${idPrefix}_-check-all`}
     checked={checked}
     onChange={handleChange}
     value="-check-all">
      (Select all)
    </CheckboxInput>
  </>;
}


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
    <CheckboxInput
     id={`${idPrefix}_${name}`}
     checked={checked}
     onChange={handleChange}
     value={name}>
      {label ? label : capitalize(name)}
    </CheckboxInput>
  </>;
}
