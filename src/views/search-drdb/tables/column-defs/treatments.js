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
  timing: PropTypes.number,
  endTiming: PropTypes.number,
  dosage: PropTypes.number,
  dosageUnit: PropTypes.string
};

function ItemTreatment({
  rxType,
  rxName,
  abNames,
  timing,
  endTiming,
  dosage,
  dosageUnit
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
    {timing ?
      <sub>
        {'('}
        {timing}{endTiming > timing ? `-${endTiming}` : null} mon
        {dosage && dosageUnit ?
          `; ${dosage.toLocaleString('en-US')} ${dosageUnit}` : null}
        {')'}
      </sub> : null}
  </span>;
}

function exportTreatment({
  rxType,
  rxName,
  abNames,
  timing,
  endTiming,
  dosage,
  dosageUnit
}) {
  const suffix = timing ? ` (${timing}${
    endTiming > timing ? `-${endTiming}` : ''
  } mon${
    dosage && dosageUnit ?
      `; ${dosage} ${dosageUnit}` : ''
  })` : '';
  if (rxType === 'antibody') {
    return abNames.join(' + ') + suffix;
  }
  else if (rxType === 'conv-plasma') {
    return 'CP' + suffix;
  }
  else if (rxType === 'vacc-plasma') {
    return 'VP' + suffix;
  }
  else {
    return rxName + suffix;
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
        label: labels.treatment || <>
          Treatment<br />(Timepoint; Dosage)
        </>,
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
        label: labels.treatments || <>
          Treatments<br />(Timepoint; Dosage)
        </>,
        render: treatments => <div className={style.treatments}>
          {treatments.length > 0 ? treatments.map(
            (rx, idx) => <React.Fragment key={idx}>
              {idx === 0 ? null : ' ⇒ '}
              <ItemTreatment {...rx} />
            </React.Fragment>
          ) : <em>Untreated</em>}
        </div>,
        exportCell: treatments => (
          treatments.map(exportTreatment).join(' => ') || 'Untreated'
        )
      });
    },
    [columns, labels.treatments, skip]
  );
}
