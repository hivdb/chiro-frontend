import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import VirusExpTable from './virus-experiments';
import searchResultQuery from './search-result.gql';

import {
  compoundShape,
  virusExperimentsShape
} from './prop-types';


class SearchResultInner extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    compoundName: PropTypes.string.isRequired,
    compound: compoundShape.isRequired,
    virusExperiments: virusExperimentsShape.isRequired
  }

  redirectIfNeeded() {
    const {
      router,
      match: {
        location: {pathname, query}
      },
      compoundName: qCompoundName,
      compound: {name: compoundName} = {},
    } = this.props;
    if (compoundName !== qCompoundName) {
      router.push({
        pathname, query: {...query, compound_name: compoundName}
      });
    }
  }

  render() {
    this.redirectIfNeeded();
    const {
      compound,
      virusExperiments
    } = this.props;
    return <Grid>
      <Grid.Row centered>
        <Grid.Column width={12}>
          <Header as="h3">
            InVitro (Cells) Experiments
          </Header>
          <VirusExpTable data={virusExperiments} />
        </Grid.Column>
      </Grid.Row>
    </Grid>;
  }

}


export default function SearchResult({match, ...props}) {
  const {
    location: {
      query: {
        compound_name: compoundName
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchResultQuery, {
    variables: {compoundName}
  });
  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <SearchResultInner
     compoundName={compoundName}
     match={match}
     {...props}
     {...data} />
  );
}
