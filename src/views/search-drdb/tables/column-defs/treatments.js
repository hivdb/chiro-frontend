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
  abNames: PropTypes.arrayOf(PropTypes.string.isRequired)
};


function ItemTreatment({
  rxType,
  rxName,
  abNames
}) {
  return <span className={style['item-treatment']}>
    {rxType === 'antibody' ?
      <>
        {abNames.map((abName, idx) => <React.Fragment key={abName}>
          {idx === 0 ? '' : ' + '}
          {abName}
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
  abNames
}) {
  if (rxType === 'antibody') {
    return abNames.join(' + ');
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


export function useTreatment({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('treatment')) {
        return null;
      }
      return new ColumnDef({
        name: 'treatment',
        label: labels.treatment || 'Treatment',
        render: (_, row) => <div className={style.treatments}>
          <ItemTreatment {...row} />
        </div>,
        exportCell: (_, row) => exportTreatment(row)
      });
    },
    [columns, labels.treatment, skip]
  );
}


export default function useTreatments({labels, skip, columns}) {
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
              <ItemTreatment {...rx} />
            </React.Fragment>
          ) : <em>Untreated</em>}
        </div>,
        exportCell: treatments => (
          treatments
            .map(exportTreatment)
            .join(' + ') || 'Untreated'
        )
      });
    },
    [columns, labels.treatments, skip]
  );
}
