import React from 'react';
import PropTypes from 'prop-types';
import SimpleTable, {
  ColumnDef
} from 'icosa/components/simple-table';

// import getTargetShowName from './utils';

function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }

  let data = expData.edges.map(({node}) => {
    node = {...node};
    const experimentCounts = node.experimentCounts;
    for (const expCounts of experimentCounts) {
      const {category, count} = expCounts;
      node[category] = count;
    }

    node['compoundCount2'] = node['compoundObjs']['totalCount'];
    return node;
  });

  return data;
}


export default function TargetTable({changeTarget, data}) {

  const tableColumns = React.useMemo(() => {

    const handleTarget = target => () => changeTarget(target);

    return [
      new ColumnDef({
        name: 'name',
        label: 'Target',
        render: (name) => {
          // const showName = getTargetShowName(name);
          return (
            <a
             onClick={handleTarget(name)}
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
        label: 'Biochemistry'
      }),
      new ColumnDef({
        name: 'CellCulture',
        label: 'Cell culture'
      }),
      new ColumnDef({
        name: 'FusionAssay',
        label: 'Entry assay'
      }),
      new ColumnDef({
        name: 'Pseudovirus',
        label: 'Pseudovirus'
      }),
      new ColumnDef({
        name: 'Animal',
        label: 'Animal model'
      }),
      new ColumnDef({
        name: 'Clinical',
        label: 'Clinical study'
      }),
      new ColumnDef({
        name: 'expArticleCount',
        label: 'References'
      })
    ];
  }, [changeTarget]);


  return (
    <SimpleTable
     columnDefs={tableColumns}
     data={reformExpData(data)} />
  );
}


TargetTable.propTypes = {
  changeTarget: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};
