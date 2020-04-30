import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {Loader} from 'semantic-ui-react';

import SearchQuery from './compound.query.gql.js';

import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';


const tableColumns = [
  new ColumnDef({
    name: 'name',
    label: 'Compound',
  }),
  new ColumnDef({
    name: 'targetShowName',
    label: 'Target',
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
  const targetName = selectedTarget['name'];
  const targetShowName = selectedTarget['showname'];
  if (!expData || !expData.edges) {
    return [];
  }
  let data = expData.edges.map(({node}) => {
    const experimentCounts = node.experimentCounts;
    for (const exp_counts of experimentCounts) {
      const {category, count} = exp_counts;
      node[category] = count;
    }
    node['targetShowName'] = targetShowName;
    return node;
  });

  data = data.filter(node => {
    return node['target'] === targetName;
  });

  return data;
}


class CompoundTableInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compounds: PropTypes.object,
    selectedTarget: PropTypes.object,
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      compounds,
      selectedTarget,
      loading
    } = this.props;

    return (
      <>{
        loading? <Loader active inline="centered" /> :
        <ChiroTable
         columnDefs={tableColumns}
         data={reformExpData(compounds, selectedTarget)} />
      }</>
    );
  }
}

export default function CompoundTable({selectedTarget}) {
  const targetName = selectedTarget['name'];
  let {loading, error, data} = useQuery(SearchQuery, {
    variables: {
      compoundTarget: targetName
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

  return <CompoundTableInner {...data} selectedTarget={selectedTarget}/>;
}