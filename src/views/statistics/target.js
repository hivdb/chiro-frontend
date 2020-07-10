import React from 'react';
import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';

// import getTargetShowName from './utils';

function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }

  let data = expData.edges.map(({node}) => {
    const experimentCounts = node.experimentCounts;
    for (const exp_counts of experimentCounts) {
      const {category, count} = exp_counts;
      node[category] = count;
    }

    node['compoundCount2'] = node['compoundObjs']['totalCount'];
    return node;
  });

  return data;
}


export default class TargetTable extends React.Component {

  handleTarget = (target) => {
    const {changeTarget} = this.props;
    return (e) => {
      changeTarget(target);
    };
  }

  render() {
    const {data} = this.props;

    const tableColumns = [
      new ColumnDef({
        name: 'name',
        label: 'Target',
        render: (name) => {
          // const showName = getTargetShowName(name);
          return (
            <a
             onClick={this.handleTarget(name)}
             href={"#" + name}>{name}</a>);
        }
      }),
      new ColumnDef({
        name: 'compoundCount2',
        label: 'Compounds',
        render: (obj, row) => {
          const target = row['name'];
          if (
            target === 'Entry - Fusion inhibitor' ||
            target === 'Entry - Monoclonal antibody' ||
            target === 'Interferons') {
            return obj;
          }
          else {
            return row['compoundCount'];
          }
        }
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
        name: 'FusionAssay',
        label: 'Entry assay',
      }),
      new ColumnDef({
        name: 'Pseudovirus',
        label: 'Pseudovirus',
      }),
      new ColumnDef({
        name: 'Animal',
        label: 'Animal model',
      }),
      new ColumnDef({
        name: 'Clinical',
        label: 'Clinical study',
      }),
      new ColumnDef({
        name: 'articleCount',
        label: 'References',
      }),
    ];


    return (
      <ChiroTable
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }
}
