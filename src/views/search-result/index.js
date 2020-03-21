import React from 'react';
import defer from 'lodash/defer';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import VirusExpTable from './virus-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';

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

  handleQueryChange = (value, category) => {
    const {
      router,
      match: {
        location: {pathname, query}
      }
    } = this.props;
    const newQuery = {...query};
    value = value || undefined;
    let changed = false;
    if (category === 'compounds') {
      if (value !== query.compound) {
        newQuery.compound = value;
        changed = true;
      }
    }
    else {  // viruses
      if (value !== query.virus) {
        newQuery.virus = value;
        changed = true;
      }
    }
    if (changed) {
      defer(() => router.push({pathname, query: newQuery}));
    }
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
      qCompoundName,
      qVirusName,
      virusExperiments
    } = this.props;
    return <Grid>
      <Grid.Row centered>
        <Grid.Column width={12}>
          <InlineSearchBox
           compoundValue={qCompoundName}
           virusValue={qVirusName}
           onChange={this.handleQueryChange}
          />
        </Grid.Column>
      </Grid.Row>
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
