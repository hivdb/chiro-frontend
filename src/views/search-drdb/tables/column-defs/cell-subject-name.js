import React from 'react';
import PropTypes from 'prop-types';


CellSubjectName.propTypes = {
  subjectName: PropTypes.string.isRequired
};

export default function CellSubjectName({subjectName}) {
  return <>
    {subjectName.replace(/\bPatient/i, 'PT')}
  </>;
}
