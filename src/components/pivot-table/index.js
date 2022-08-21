import React from 'react';
import PropTypes from 'prop-types';

import SimpleTable from 'icosa/components/simple-table';
import {
  columnDefShape
} from 'icosa/components/simple-table/prop-types';

import ColumnDef from './column-def';
import useAggregateData from './use-aggregate-data';

export {ColumnDef, useAggregateData};


PivotTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.object.isRequired
  ).isRequired,
  groupBy: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  columnDefs: PropTypes.arrayOf(
    columnDefShape.isRequired
  ).isRequired
};


export default function PivotTable({
  data,
  groupBy,
  columnDefs,
  ...props
}) {

  const aggData = useAggregateData({data, groupBy, columnDefs});
  return (
    <SimpleTable
     data={aggData}
     columnDefs={columnDefs}
     {...props} />
  );
}
