import React from 'react';
import PropTypes from 'prop-types';

import SimpleTable from 'icosa/components/simple-table';

import useColumnDefs from '../column-defs';
import Modal from '../../../../components/modal';

import style from './style.module.scss';


function ungroupData(data, groups) {
  let numRows;
  const rows = [];
  const scalarCols = {};
  const groupedCols = {};
  for (const [key, val] of Object.entries(data)) {
    if (
      val instanceof Array &&
      (![
        'abNames',
        'unlinkedControlPotency',
        'unlinkedPotency'
      ].includes(key) || val[0] instanceof Array)
    ) {
      numRows = val.length;
      groupedCols[key] = val;
    }
    else {
      scalarCols[key] = val;
    }
  }
  for (let i = 0; i < numRows; i ++) {
    const row = {...scalarCols};
    for (const [key, vals] of Object.entries(groupedCols)) {
      if (groups.includes(key)) {
        row[key] = vals[i];
      }
      else {
        row[key] = [vals[i]];
      }
    }
    rows.push(row);
  }
  return rows;
}

function ungroupUnlinkedPotency(data) {
  const rows = [];
  for (const row of data) {
    if (
      row.unlinkedControlPotency[0] &&
      row.unlinkedControlPotency[0].length > 0
    ) {
      for (
        const {potency, cumulativeCount, ineffective}
        of row.unlinkedControlPotency[0]
      ) {
        rows.push({
          ...row,
          ineffective: [ineffective ? 'control' : null],
          controlPotency: [potency],
          controlCumulativeCount: [cumulativeCount],
          potency: [null],
          cumulativeCount: [cumulativeCount],
          unlinkedControlPotency: [null],
          unlinkedPotency: [null],
          foldCmp: [null],
          fold: [null]
        });
      }
    }
    if (
      row.unlinkedPotency[0] &&
      row.unlinkedPotency[0].length > 0
    ) {
      for (
        const {potency, cumulativeCount, ineffective}
        of row.unlinkedPotency[0]
      ) {
        rows.push({
          ...row,
          ineffective: [ineffective ? 'experimental' : null],
          controlPotency: [null],
          controlCumulativeCount: [null],
          potency: [potency],
          cumulativeCount: [cumulativeCount],
          unlinkedControlPotency: [null],
          unlinkedPotency: [null],
          foldCmp: [null],
          fold: [null]
        });
      }
    }
    else {
      rows.push(row);
    }
  }
  return rows;
}

RawSuscResults.propTypes = {
  data: PropTypes.object,
  tableConfig: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    labels: PropTypes.objectOf(
      PropTypes.node.isRequired
    ).isRequired,
    rawDataLabels: PropTypes.objectOf(
      PropTypes.node.isRequired
    ).isRequired,
    groupBy: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    defaultGroupBy: PropTypes.arrayOf(
      PropTypes.string.isRequired
    )
  }).isRequired,
  onClose: PropTypes.func.isRequired
};


const REMOVE_COLS = ['numStudies', 'dataAvailability'];

function useCleanedColumnDefs({columns, labels}) {
  const columnDefs = useColumnDefs({columns, labels});
  return React.useMemo(
    () => {
      return columnDefs.filter(({name}) => !REMOVE_COLS.includes(name));
    },
    [columnDefs]
  );
}


export default function RawSuscResults({
  data,
  tableConfig: {
    columns,
    labels,
    rawDataLabels,
    groupBy
  },
  onClose
}) {
  const ungrouped = ungroupUnlinkedPotency(
    ungroupData(data, groupBy)
  );
  const columnDefs = useCleanedColumnDefs({
    columns,
    labels: rawDataLabels || labels
  });

  return (
    <Modal
     closeOnBlur
     closeOnEsc
     onClose={onClose}
     minHeight="20vh"
     width="95vw">
      <h2>Raw susceptibility results</h2>
      <br />
      <SimpleTable
       className={style['raw-data-table']}
       columnDefs={columnDefs}
       cacheKey="raw-susc-results"
       data={ungrouped} />
    </Modal>
  );
}
