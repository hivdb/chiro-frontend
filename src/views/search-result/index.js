import React from 'react';
import defer from 'lodash/defer';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import StatTable from './stat';
import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';

import {
  compoundShape,
  virusExperimentsShape,
  biochemExperimentsShape
} from './prop-types';


class SearchResultInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    qCompoundName: PropTypes.string,
    qVirusName: PropTypes.string,
    compound: compoundShape,
    virusExperiments: virusExperimentsShape,
    biochemExperiments: biochemExperimentsShape
  }

  static defaultProps = {
    loading: false
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
      virusExperiments,
      biochemExperiments,
      loading
    } = this.props;
    return <Grid stackable>
      <InlineSearchBox
       compoundValue={qCompoundName}
       virusValue={qVirusName}
       onChange={this.handleQueryChange}>
        {({compoundDropdown, virusDropdown}) => (
          <Grid.Row>
            <Grid.Column width={2}></Grid.Column>
            <StatTable>
              {[
                {
                  title: 'Selection',
                  width: 4,
                  cells: [
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown}
                  ]
                },
                {
                  title: 'Results',
                  width: 2,
                  cells: [
                    {
                      label: <a href="#invitro-cells">
                        Cell Culture
                      </a>,
                      value: (
                        loading ?
                          <Loader active inline size="mini" /> :
                          virusExperiments.totalCount
                      )
                    },
                    {
                      label: <a href="#invitro-biochem">
                        Biochemistry
                      </a>,
                      value: (
                        loading ?
                          <Loader active inline size="mini" /> :
                          biochemExperiments.totalCount
                      )
                    },
                    {label: 'Animal models', value: 'pending'},
                    {label: 'Clinical studies', value: 'pending'},
                  ]
                }
              ]}
            </StatTable>
          </Grid.Row>
        )}
      </InlineSearchBox>
      <Grid.Row centered>
        <Grid.Column width={12}>
          <Header as="h2" dividing id="invitro-cells">
            Cell Culture
          </Header>
          {loading ?
            <Loader active inline="centered" /> :
            <VirusExpTable
             compoundName={qCompoundName}
             virusName={qVirusName}
             data={virusExperiments} />}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={12}>
          <Header as="h2" dividing id="invitro-biochem">
            Biochemistry
          </Header>
          {loading ?
            <Loader active inline="centered" /> :
            <BiochemExpTable
             compoundName={qCompoundName}
             virusName={qVirusName}
             data={biochemExperiments} />}
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
    // return <Loader active inline="centered" />;
    return (
      <SearchResultInner
       qCompoundName={compoundName}
       qVirusName={virusName}
       match={match}
       loading
       {...props} />
    );
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
