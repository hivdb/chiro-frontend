import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {Loader} from 'semantic-ui-react';

import SearchQuery from './compound.query.gql.js';

import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';

import getTargetShowName from './utils';


const tableColumns = [
  new ColumnDef({
    name: 'name',
    label: 'Compound',
  }),
  new ColumnDef({
    name: 'target',
    label: 'Target',
    render: (name) => {
      return getTargetShowName(name);
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
    name: 'EntryAssay',
    label: 'Entry assay',
  }),

  new ColumnDef({
    name: 'Animal',
    label: 'Animal model',
  }),
  new ColumnDef({
    name: 'Clinical',
    label: 'Clinical study',
  }),
  // new ColumnDef({
  //   name: 'target_sum_exp_num',
  //   label: 'Total',
  // }),
  new ColumnDef({
    name: 'articleCount',
    label: 'References',
  }),
  new ColumnDef({
    name: 'clinicalTrialCount',
    label: 'Clinical trials',
  }),
];

function reformExpData(expData, selectedTarget) {
  if (!expData || !expData.edges) {
    return [];
  }
  let data = expData.edges.map(({node}) => {
    const experimentCounts = node.experimentCounts;
    let totalExpCount = 0;
    for (const exp_counts of experimentCounts) {
      const {category, count} = exp_counts;
      node[category] = count;
      totalExpCount += count;
    }
    node['totalExpCount'] = totalExpCount;
    return node;
  });

  data = data.filter(node => {
    return (
      node['target'] === selectedTarget &&
      node['totalExpCount'] !== 0
    );
  });

  return data;
}


class CompoundTableInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compounds: PropTypes.object,
    selectedTarget: PropTypes.string,
    cacheKey: PropTypes.string,
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
        loading? <Loader active inline="centered" /> :
        <ChiroTable
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
      countIndividualCompound: countIndividualCompound,
      withPendingList: withPendingList,
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