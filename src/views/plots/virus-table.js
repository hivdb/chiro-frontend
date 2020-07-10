import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {Loader} from 'semantic-ui-react';

import SearchQuery from './virus.query.gql.js';
import ChiroTable from '../../components/chiro-table';
import {ColumnDef} from '../../components/chiro-table';

class VirusTableInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    viruses: PropTypes.object.isRequired,
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      viruses,
    } = this.props;

    return <>{
      loading? <Loader active inline="centered" /> :
      <TargetTable data={viruses}/>
    }</>;
  }
}


class TargetTable extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  render() {
    const {data} = this.props;

    const tableColumns = [
      new ColumnDef({
        name: 'name',
        label: 'Virus',
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
        label: 'Fusion assay',
      }),
      new ColumnDef({
        name: 'Animal',
        label: 'Animal model',
      }),
      new ColumnDef({
        name: 'Clinical',
        label: 'Clinical study',
      }),
    ];


    return (
      <ChiroTable
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }
}


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
    return node;
  });

  return data;
}


export default function VirusTable({match, ...props}) {
  let {loading, error, data} = useQuery(SearchQuery);
  if (loading) {
    return (
      <VirusTableInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <VirusTableInner
     {...props}
     {...data}/>);
}
