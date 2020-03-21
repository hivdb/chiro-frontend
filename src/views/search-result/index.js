import React from 'react';
import defer from 'lodash/defer';
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
    qCompoundName: PropTypes.string,
    qVirusName: PropTypes.string,
    compound: compoundShape,
    virusExperiments: virusExperimentsShape.isRequired
  }

  redirectIfNeeded() {
    const {
      router,
      match: {
        location: {pathname, query}
      },
      qCompoundName, qVirusName,
      compound: {name: compoundName} = {name: null},
      virus: {name: virusName} = {name: null}
    } = this.props;

    const newQuery = {...query};
    let changed = false;

    if (compoundName && qCompoundName !== compoundName) {
      newQuery.compound = compoundName;
      changed = true;
    }

    if (virusName && qVirusName !== virusName) {
      newQuery.virus = virusName;
      changed = true;
    }
    if (changed) {
      defer(() => router.push({pathname, query: newQuery}));
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
        compound: compoundName,
        virus: virusName
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchResultQuery, {
    variables: {
      compoundName, virusName,
      withCompound: Boolean(compoundName),
      withVirus: Boolean(virusName)
    }
  });
  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <SearchResultInner
     qCompoundName={compoundName}
     qVirusName={virusName}
     match={match}
     {...props}
     {...data} />
  );
}
