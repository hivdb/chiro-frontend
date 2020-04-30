import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {Grid, Header, Loader} from 'semantic-ui-react';

import SearchQuery from './target.query.gql.js';
import setTitle from '../../utils/set-title';

import TargetTable from './target';
import CompoundTable from './compound';

import style from './style.module.scss';

class StatisticsInner extends React.Component {

  state = {selectedTarget: null}

  handleChangeTarget = (target, showname) => {
    this.setState({
      selectedTarget: {
        name: target,
        showname: showname,
      },
    });
  }

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compoundTargets: PropTypes.object,
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      compoundTargets,
    } = this.props;
    const {
      selectedTarget
    } = this.state;
    setTitle('Statistics');
    return <>{loading? <Loader active inline="centered" /> :
      <Grid stackable>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as="h2" dividing id="target-stat">
                Target
            </Header>
            <TargetTable
             data={compoundTargets}
             changeTarget={this.handleChangeTarget} />
          </Grid.Column>
        </Grid.Row>
        {selectedTarget?
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as="h2" dividing id="compound-stat">
                Compound for {selectedTarget['showname']}
            </Header>
            <CompoundTable target={selectedTarget['name']}/>
          </Grid.Column>
        </Grid.Row>
        : <></>}

        {/* <Grid.Row>
          <Table celled className={style.targetTable}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Header</Table.HeaderCell>
                <Table.HeaderCell>Header</Table.HeaderCell>
                <Table.HeaderCell>Header</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Accordion as={Table.Body} panels={
              [
                {
                  key: 1,
                  as: 'tr',
                  title: {
                    as: Table.Row,
                    children: [
                      <Table.Cell>Cell</Table.Cell>,
                      <Table.Cell>Cell</Table.Cell>,
                      <Table.Cell>Cell</Table.Cell>,
                    ]
                  },
                  content: {
                    as: Table.Row,
                    children: [
                    <Table.Cell colSpan={3}>
                      <TargetTable data={compoundTargets} />
                    </Table.Cell>
                    ]
                  }
                }
              ]
            }>
            </Accordion>
          </Table>
        </Grid.Row> */}
      </Grid>
    }</>
  }
}


export default function Statistics({match, ...props}) {
  let {loading, error, data} = useQuery(SearchQuery);
  if (loading) {
    return (
      <StatisticsInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return <StatisticsInner {...props} {...data}/>
}