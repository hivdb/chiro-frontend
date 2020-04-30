import React from 'react';

import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';

const tableColumns = [
  new ColumnDef({
    name: 'name',
    label: 'Target',
  }),
  new ColumnDef({
    name: 'compoundCount',
    label: 'Compound',
  }),
  new ColumnDef({
    name: 'Biochem',
    label: 'Biochemistry',
  }),
  new ColumnDef({
    name: 'CellCulture',
    label: 'Cell culture',
  }),
  new ColumnDef({
    name: 'EntryAssay',
    label: 'Entry assay',
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
    name: 'articleCount',
    label: 'References',
  }),
];

function updateTargetName(name) {
  if (name === '3CL Protease') {
    name = 'Protease - 3CL';
  }
  if (name === 'PL Protease') {
    name = 'Protease - PL';
  }
  if (name === 'HIV PIs') {
    name = 'Protease - HIV PIs';
  }
  if (name == 'Entry - Receptor binding') {
    name = 'Entry - Miscellaneous';
  }
  if (name === 'Host Protease') {
    name = 'Entry - Host protease';
  }
  if (name === 'Host Endosomal Trafficking') {
    name = 'Host - Endosomal trafficking';
  }
  if (name === 'Host Cyclophilin Inhibition') {
    name = 'Host - Cyclophilin inhibition';
  }
  if (name === 'Host') {
    name = 'Host - Miscellaneous';
  }
  return name
}

function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }
  let deleteEntry = {}
  let deleteHost = {}
  let data = expData.edges.map(({node}) => {
    const experimentCounts = node.experimentCounts;
    for (const exp_counts of experimentCounts) {
      const {category, count} = exp_counts;
      node[category] = count;

      if (node['name'] === 'Entry - Monoclonal antibody') {
        if (category in deleteEntry) {
          deleteEntry[category] += count;
        } else {
          deleteEntry[category] = 0;
          deleteEntry[category] += count;
        }
      }
      if (
        node['name'] === 'Host Protease' ||
        node['name'] === 'Host Endosomal Trafficking' ||
        node['name'] === 'Host Cyclophilin Inhibition'
      ) {
        if (category in deleteHost) {
          deleteHost[category] += count;
        } else {
          deleteHost[category] = 0;
          deleteHost[category] += count;
        }
      }
    }

    return node;
  });

  data = data.map((node) => {
    if (node['name'] === 'Entry - Receptor binding') {
      for (const category in deleteEntry) {
        node[category] -= deleteEntry[category];
      }
    }

    if (node['name'] === 'Host') {
      for (const category in deleteHost) {
        node[category] -= deleteHost[category];
      }
    }

    node['name'] = updateTargetName(node['name']);
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