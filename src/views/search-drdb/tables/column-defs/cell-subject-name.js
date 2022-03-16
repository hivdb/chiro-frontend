import React from 'react';
import PropTypes from 'prop-types';


CellSubjectName.propTypes = {
  subjectName: PropTypes.string.isRequired,
  subjectSpecies: PropTypes.string.isRequired
};

export default function CellSubjectName({subjectName, subjectSpecies}) {
  return <>
    {subjectName}
    {subjectSpecies === 'Human' ? null : ` (${subjectSpecies})`}
  </>;
}
