import React from 'react';
import PropTypes from 'prop-types';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {AiOutlineTable} from '@react-icons/all-files/ai/AiOutlineTable';
import {AiOutlineCheck} from '@react-icons/all-files/ai/AiOutlineCheck';
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';

import {ModalContext} from '../pivot-table-wrapper';

import {aggDataAvailability} from './agg-funcs';
import style from './style.module.scss';


function exportCellDataAvailability(hasMultiple) {
  return hasMultiple ? '✓' : '';
}

CellDataAvailability.propTypes = {
  data: PropTypes.object,
  hasMultiple: PropTypes.bool.isRequired
};

function CellDataAvailability({hasMultiple, data}) {
  const {setData} = React.useContext(ModalContext);
  const handleClick = React.useCallback(() => setData(data), [data, setData]);

  return (
    <div
     className={style['data-availability']}
     onClick={hasMultiple ? handleClick : undefined}
     data-has-multiple={hasMultiple}>
      <AiOutlineTable />
      {hasMultiple ?
        <AiOutlineCheck className={style['yes']} /> :
        <AiOutlineClose className={style['no']} />}
      <div className={style.desc}>
        {hasMultiple ?
          'Individual data points available' :
          'Data published only in aggregate form'}
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
        render: (hasMultiple, data) => (
          <CellDataAvailability hasMultiple={hasMultiple} data={data} />
        ),
        exportCell: exportCellDataAvailability,
        decorator: aggDataAvailability
      });
    },
    [columns, labels.dataAvailability, skip]
  );
}
