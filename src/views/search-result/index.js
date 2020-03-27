import React from 'react';
import {Link} from 'found';
import defer from 'lodash/defer';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader, Breadcrumb} from 'semantic-ui-react';

import StatTable from './stat';
import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import AnimalExpTable from './animal-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';

import ArticleInfo from './article-info';
import style from './style.module.scss';

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
    delete newQuery.article;
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

  renderBreadcrumb() {
    const {
      qCompoundName, qVirusName, qArticleNickname
    } = this.props;
    return <Breadcrumb>
      <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      <Breadcrumb.Section as={Link} to="/search/">
        Experiment Search
      </Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      <Breadcrumb.Section active>
        Search{' '}
        {[...(qCompoundName ? [`compound “${qCompoundName}”`] : []),
          ...(qVirusName ? [`virus “${qVirusName}”`] : []),
          ...(qArticleNickname ? [`article “${qArticleNickname}”`] : []),
          ...((!qCompoundName && !qVirusName && !qArticleNickname) ?
            ['all'] : []
          )
        ].join(' and ')}
      </Breadcrumb.Section>
    </Breadcrumb>;
  }

  render() {
    this.redirectIfNeeded();
    const {
      qCompoundName,
      qVirusName,
      qArticleNickname,
      compound,
      article,
      virusExperiments,
      biochemExperiments,
      animalExperiments,
      loading
    } = this.props;
    const cacheKey = `${qCompoundName}@@${qVirusName}@@${qArticleNickname}`;
    return <Grid stackable className={style['search-result']}>
      <Grid.Row>
        {this.renderBreadcrumb()}
      </Grid.Row>
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
                  width: 8
                }] : []),
                ...(!compound && article ? [{
                  description: <ArticleInfo {...article} />,
                  width: 8
                }] :[])
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
             cacheKey={cacheKey}
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
             cacheKey={cacheKey}
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
             cacheKey={cacheKey}
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
        virus: virusName,
        article: articleNickname
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchResultQuery, {
    variables: {
      compoundName, virusName, articleNickname,
      withCompound: Boolean(compoundName),
      withVirus: Boolean(virusName),
      withArticle: Boolean(articleNickname)
    }
  });
  if (loading) {
    // return <Loader active inline="centered" />;
    return (
      <SearchResultInner
       qCompoundName={compoundName}
       qVirusName={virusName}
       qArticleNickname={articleNickname}
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
     qArticleNickname={articleNickname}
     match={match}
     {...props}
     {...data} />
  );
}
