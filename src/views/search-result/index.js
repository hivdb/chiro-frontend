import React from 'react';
import defer from 'lodash/defer';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import StatTable from './stat';
import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import AnimalExpTable from './animal-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';

import {
  compoundShape,
  virusExperimentsShape,
  biochemExperimentsShape,
  animalExperimentsShape
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
    biochemExperiments: biochemExperimentsShape,
    animalExperiments: animalExperimentsShape
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
      compound,
      virusExperiments,
      biochemExperiments,
      animalExperiments,
      loading
    } = this.props;
    return <Grid stackable>
      <Grid.Row>
        <InlineSearchBox
         compoundValue={qCompoundName}
         virusValue={qVirusName}
         onChange={this.handleQueryChange}>
          {({compoundDropdown, virusDropdown}) => (
            <StatTable>
              {[
                {
                  title: 'Selection',
                  width: 5,
                  cells: [
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown}
                  ]
                },
                {
                  title: 'Results',
                  width: 3,
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
                    {
                      label: <a href="#animal-models">
                        Animal models
                      </a>,
                      value: (
                        loading ?
                          <Loader active inline size="mini" /> :
                          animalExperiments.totalCount
                      )
                    },
                    {label: 'Clinical studies', value: 'pending'},
                  ]
                },
                ...(compound ? [{
                  description: compound.description,
                  width: 8,
                  cells: [
                    {label: 'Target', value: compound.target},
                    {label: 'Drug Class', value: compound.drugClassName},
                    {label: 'Category', value: compound.category},
                    ...(compound.synonyms.length > 0 ? [{
                      label: 'Synonyms',
                      value: compound.synonyms.join(' / ')
                    }] : []),
                    ...(compound.relatedCompounds.length > 0 ? [{
                      label: 'Related Compounds',
                      value: (
                        compound.relatedCompounds
                        .map(({name}) => name).join(' / ')
                      )
                    }] : [])
                  ]
                }] : [])
              ]}
            </StatTable>
          )}
        </InlineSearchBox>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={16}>
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
        <Grid.Column width={16}>
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
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as="h2" dividing id="animal-models">
            Animal Models
          </Header>
          {loading ?
            <Loader active inline="centered" /> :
            <AnimalExpTable
             compoundName={qCompoundName}
             virusName={qVirusName}
             data={animalExperiments} />}
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
