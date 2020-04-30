import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {Grid, Header, Loader} from 'semantic-ui-react';

import SearchQuery from './query.gql.js';
import setTitle from '../../utils/set-title';

import TargetTable from './target';
import CompoundTable from './compound';


class StatisticsInner extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compoundTargets: PropTypes.object,
    compounds: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      compoundTargets,
      compounds
    } = this.props;
    setTitle('Statistics');
    return <>{loading? <Loader active inline="centered" /> :
      <Grid stackable>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as="h2" dividing id="target-stat">
                Target
            </Header>
            <TargetTable data={compoundTargets} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as="h2" dividing id="compound-stat">
                Compound
            </Header>
            <CompoundTable data={compounds} />
          </Grid.Column>
        </Grid.Row>
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