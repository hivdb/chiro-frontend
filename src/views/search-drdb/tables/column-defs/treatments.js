import React from 'react';
import PropTypes from 'prop-types';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';
// import {Popup} from 'semantic-ui-react';
import style from './style.module.scss';

ItemTreatment.propTypes = {
  rxType: PropTypes.oneOf([
    'antibody', 'conv-plasma', 'vacc-plasma', 'unclassified'
  ]).isRequired,
  rxName: PropTypes.string.isRequired,
  abNames: PropTypes.arrayOf(PropTypes.string.isRequired),
  antibodyLookup: PropTypes.objectOf(
    PropTypes.shape({
      abbreviationName: PropTypes.string
    }).isRequired
  ).isRequired
};


function ItemTreatment({
  rxType,
  rxName,
  abNames,
  antibodyLookup
}) {
  return <span className={style['item-treatment']}>
    {rxType === 'antibody' ?
      <>
        {abNames.map((abName, idx) => <React.Fragment key={abName}>
          {idx === 0 ? '' : ' + '}
          {antibodyLookup &&
          abName in antibodyLookup &&
          antibodyLookup[abName].abbreviationName ?
            antibodyLookup[abName].abbreviationName :
            abName}
        </React.Fragment>)}
      </> : null}
    {rxType === 'conv-plasma' ? <>
      CP
    </> : null}
    {rxType === 'vacc-plasma' ? <>
      VP
    </> : null}
    {rxType === 'unclassified' ? <>
      <em>{rxName}</em>
    </> : null}
  </span>;
}

function exportTreatment({
  rxType,
  rxName,
  abNames,
  antibodyLookup
}) {
  if (rxType === 'antibody') {
    return abNames.map(
      abName => (
        antibodyLookup &&
        abName in antibodyLookup &&
        antibodyLookup[abName].abbreviationName ?
          antibodyLookup[abName].abbreviationName :
          abName
      )
    ).join(' + ');
  }
  else if (rxType === 'conv-plasma') {
    return 'CP';
  }
  else if (rxType === 'vacc-plasma') {
    return 'VP';
  }
  else {
    return rxName;
  }
}


export function useTreatment({
  antibodyLookup,
  labels,
  skip,
  columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('treatment')) {
        return null;
      }
      return new ColumnDef({
        name: 'treatment',
        label: labels.treatment || 'Treatment',
        render: (_, row) => <div className={style.treatments}>
          <ItemTreatment {...row} antibodyLookup={antibodyLookup} />
        </div>,
        exportCell: (_, row) => exportTreatment({...row, antibodyLookup})
      });
    },
    [antibodyLookup, columns, labels.treatment, skip]
  );
}


export default function useTreatments({
  antibodyLookup,
  labels,
  skip,
  columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('treatments')) {
        return null;
      }
      return new ColumnDef({
        name: 'treatments',
        label: labels.treatments || 'Treatments',
        render: treatments => <div className={style.treatments}>
          {treatments.length > 0 ? treatments.map(
            (rx, idx) => <React.Fragment key={idx}>
              {idx === 0 ? null : ' + '}
              <ItemTreatment {...rx} antibodyLookup={antibodyLookup} />
            </React.Fragment>
          ) : 'None'}
        </div>,
        exportCell: treatments => (
          treatments
            .map(rx => exportTreatment({...rx, antibodyLookup}))
            .join(' + ') || 'None'
        )
      });
    },
    [antibodyLookup, columns, labels.treatments, skip]
  );
}
