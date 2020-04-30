import React from 'react';

import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';

const tableColumns = [
  new ColumnDef({
    name: 'name',
    label: 'Target',
  }),
  new ColumnDef({
    name: 'Biochem',
    label: 'Biochemistry',
  }),
  new ColumnDef({
    name: 'EntryAssay',
    label: 'Entry assay',
  }),
  new ColumnDef({
    name: 'CellCulture',
    label: 'Cell culture',
  }),
  new ColumnDef({
    name: 'Animal',
    label: 'Animal model',
  }),
  new ColumnDef({
    name: 'Clinical',
    label: 'Clinical trial',
  }),
  new ColumnDef({
    name: 'target_sum_exp_num',
    label: 'Total',
  }),
  new ColumnDef({
    name: 'compoundCount',
    label: '#Compound',
  }),
  new ColumnDef({
    name: 'articleCount',
    label: '#References',
  }),
];


function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }
  let data = expData.edges.map(({node}) => {
    const experimentCounts = node.experimentCounts;
    let target_sum_exp_num = 0;
    for (const exp_counts of experimentCounts) {
      const {category, count} = exp_counts;
      node[category] = count;
      target_sum_exp_num += count;
    }
    node['target_sum_exp_num'] = target_sum_exp_num;
    return node;
  });

  return data;
}


export default class TargetTable extends React.Component {

  render() {
    const {data} = this.props;

    return (
      <ChiroTable
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }
}