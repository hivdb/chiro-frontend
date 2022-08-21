import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {Loader} from 'semantic-ui-react';

import SearchQuery from './compound.query.gql.js';

import SimpleTable, {
  ColumnDef
} from 'icosa/components/simple-table';

// import getTargetShowName from './utils';


const tableColumns = [
  new ColumnDef({
    name: 'name',
    label: 'Compound'
  }),
  // new ColumnDef({
  //   name: 'target',
  //   label: 'Target',
  //   render: (name) => {
  //     return getTargetShowName(name);
  //   }
  // }),
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
    label: 'Fusion assay'
  }),

  new ColumnDef({
    name: 'Animal',
    label: 'Animal model'
  }),
  new ColumnDef({
    name: 'Clinical',
    label: 'Clinical study'
  }),
  // new ColumnDef({
  //   name: 'target_sum_exp_num',
  //   label: 'Total',
  // }),
  new ColumnDef({
    name: 'expArticleCount',
    label: 'References'
  }),
  new ColumnDef({
    name: 'clinicalTrialCount',
    label: 'Clinical trials'
  })
];

function reformExpData(expData, selectedTarget) {
  if (!expData || !expData.edges) {
    return [];
  }
  let data = expData.edges.map(({node}) => {
    node = {...node};
    const experimentCounts = node.experimentCounts;
    let totalExpCount = 0;
    for (const expCounts of experimentCounts) {
      const {category, count} = expCounts;
      node[category] = count;
      totalExpCount += count;
    }
    node['totalExpCount'] = totalExpCount;
    return node;
  });

  data = data.filter(node => {
    return (
      node['target'] === selectedTarget
      // node['totalExpCount'] !== 0
    );
  });

  return data;
}


class CompoundTableInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compounds: PropTypes.object,
    selectedTarget: PropTypes.string,
    cacheKey: PropTypes.string
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      compounds,
      loading,
      cacheKey,
      selectedTarget
    } = this.props;

    return (
      <>{
        loading ? <Loader active inline="centered" /> :
        <SimpleTable
         cacheKey={cacheKey}
         columnDefs={tableColumns}
         data={reformExpData(compounds, selectedTarget)} />
      }</>
    );
  }
}

export default function CompoundTable({selectedTarget}) {
  let countIndividualCompound = false;
  let withPendingList = false;
  if (
    selectedTarget === 'Entry - Fusion inhibitor' ||
    selectedTarget === 'Entry - Monoclonal antibody' ||
    selectedTarget === 'Interferons'
  ) {
    countIndividualCompound = true;
    withPendingList = true;
  }
  let {loading, error, data} = useQuery(SearchQuery, {
    variables: {
      compoundTarget: selectedTarget,
      countIndividualCompound,
      withPendingList,
      completeList: !withPendingList
    }
  });
  if (loading) {
    return (
      <CompoundTableInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <CompoundTableInner
     cacheKey={selectedTarget}
     {...data}
     selectedTarget={selectedTarget}/>);
}

CompoundTable.propTypes = {
  selectedTarget: PropTypes.string
};
