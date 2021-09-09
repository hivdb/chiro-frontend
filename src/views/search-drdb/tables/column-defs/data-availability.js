import React from 'react';
import PropTypes from 'prop-types';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {AiOutlineTable} from '@react-icons/all-files/ai/AiOutlineTable';
import {AiOutlineCheck} from '@react-icons/all-files/ai/AiOutlineCheck';
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';

import {aggDataAvailability} from './agg-funcs';
import style from './style.module.scss';


CellDataAvailability.propTypes = {
  hasMultiple: PropTypes.bool.isRequired
};

function exportCellDataAvailability(hasMultiple) {
  if (hasMultiple) {
    return '✓';
  }
  else {
    return '';
  }
}

function CellDataAvailability({hasMultiple}) {
  return (
    <div
     className={style['data-availability']}
     data-has-multiple={hasMultiple}>
      <AiOutlineTable />
      {hasMultiple ?
        <AiOutlineCheck className={style['yes']} /> :
        <AiOutlineClose className={style['no']} />}
      <div className={style.desc}>
        {hasMultiple ?
          'Individual data points available' :
          'Data published in only aggregate form'}
      </div>
    </div>
  );
}

export default function useDataAvailability({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('dataAvailability')) {
        return null;
      }
      return new ColumnDef({
        name: 'dataAvailability',
        label: labels.dataAvailability,
        render: hasMultiple => (
          <CellDataAvailability hasMultiple={hasMultiple} />
        ),
        exportCell: exportCellDataAvailability,
        decorator: aggDataAvailability
      });
    },
    [columns, labels.dataAvailability, skip]
  );
}
