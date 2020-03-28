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
import EntryAssayExpTable from './entry-assay-experiment';
import ClinicalExpTable from './clinical-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';

import ArticleInfo from './article-info';
import style from './style.module.scss';

import {
  compoundShape,
  virusExperimentsShape,
  entryAssayExperimentsShape,
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
    qCompoundTargetName: PropTypes.string,
    qArticleNickname: PropTypes.string,
    compound: compoundShape,
    virusExperiments: virusExperimentsShape,
    biochemExperiments: biochemExperimentsShape,
    animalExperiments: animalExperimentsShape,
    entryAssayExperiments: entryAssayExperimentsShape,
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
    else if (category === 'compoundTargets') {
      if (value !== query.target) {
        newQuery.target = value;
        changed = true;
      }
    }
    else if (category === 'articles') {
      if (value !== query.article) {
        newQuery.article = value;
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
      qArticleNickname = null,
      qCompoundTargetName = null,
      qCompoundName = null,
      qVirusName = null,
      article:{nickname: [articleNickname]} = {nickname: [null]},
      compoundTarget: {name: compoundTargetName} = {name: null},
      compound: {name: compoundName} = {name: null},
      virus: {name: virusName} = {name: null}
    } = this.props;

    const newQuery = {...query};
    let changed = false;

    if (articleNickname && qArticleNickname !== articleNickname) {
      newQuery.article = articleNickname;
      changed = true;
    }

    if (compoundTargetName && qCompoundTargetName !== compoundTargetName) {
      newQuery.target = compoundTargetName;
      changed = true;
    }

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
      qCompoundTargetName, qCompoundName, qVirusName, qArticleNickname
    } = this.props;
    let searches = [
      ...(qArticleNickname ? [`article “${qArticleNickname}”`] : []),
      ...(qVirusName ? [`virus “${qVirusName}”`] : []),
      ...(qCompoundTargetName ? [`target “${qCompoundTargetName}”`] : []),
      ...(qCompoundName ? [`compound “${qCompoundName}”`] : [])
    ];
    if (searches.length > 1) {
      let [last, ...others] = searches.reverse();
      others = others.reverse();
      searches = `${others.join(', ')} and ${last}`;
    }
    else if (searches.length === 1) {
      searches = searches[0];
    }
    else {
      searches = 'all';
    }

    return <Breadcrumb>
      <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      <Breadcrumb.Section as={Link} to="/search/">
        Experiment Search
      </Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      <Breadcrumb.Section active>
        Search {searches}
      </Breadcrumb.Section>
    </Breadcrumb>;
  }

  render() {
    this.props.loading || this.redirectIfNeeded();
    const {
      qCompoundTargetName,
      qCompoundName,
      qVirusName,
      qArticleNickname,
      compound,
      virus,
      article,
      virusExperiments,
      entryAssayExperiments,
      biochemExperiments,
      animalExperiments,
      clinicalExperiments,
      loading
    } = this.props;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qVirusName}@@${qArticleNickname}`
    );
    return <Grid stackable className={style['search-result']}>
      <Grid.Row>
        {this.renderBreadcrumb()}
      </Grid.Row>
      <Grid.Row>
        <InlineSearchBox
         articleValue={qArticleNickname}
         compoundValue={qCompoundName}
         virusValue={qVirusName}
         compoundTargetValue={qCompoundTargetName}
         onChange={this.handleQueryChange}>
          {({
            compoundDropdown,
            compoundTargetDropdown,
            virusDropdown
          }) => (
            <StatTable>
              {[
                {
                  title: 'Selection',
                  width: 5,
                  cells: [
                    {label: 'Virus', value: virusDropdown},
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown}
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
                      label: <a href="#invitro-entryassay">
                        Entry assay
                      </a>,
                      value: (
                        loading ?
                          <Loader active inline size="mini" /> :
                          entryAssayExperiments.totalCount
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
                    {
                      label: <a href="#clinical-trials">
                        Clinical Trials
                      </a>,
                      value: (
                        loading ?
                          <Loader active inline size="mini" /> :
                          clinicalExperiments.totalCount
                      )
                    },
                  ]
                },
                ...(compound ? [{
                  description: compound.description,
                  width: 8
                }] : []),
                ...(!compound && article ? [{
                  description: <ArticleInfo {...article} />,
                  width: 8
                }] : []),
                ...(!compound && !article && virus ? [{
                  description: virus.description,
                  width: 8
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
             cacheKey={cacheKey}
             data={virusExperiments} />}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column withd={16}>
          <Header as="h2" dividing id="invitro-entryassay">
            Entry Assay
          </Header>
          {loading ?
            <Loader active inline="centered" /> :
            <EntryAssayExpTable
             cacheKey={cacheKey}
             data={entryAssayExperiments} />}
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
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as="h2" dividing id="clinical-trials">
            Cinical Trials
          </Header>
          {loading ?
            <Loader active inline="centered" /> :
            <ClinicalExpTable
             cacheKey={cacheKey}
             data={clinicalExperiments} />}
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
        target: compoundTargetName,
        article: articleNickname
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchResultQuery, {
    variables: {
      compoundName, compoundTargetName, virusName, articleNickname,
      withCompound: Boolean(compoundName),
      withVirus: Boolean(virusName),
      withCompoundTarget: Boolean(compoundTargetName),
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
       qCompoundTargetName={compoundTargetName}
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
     qCompoundTargetName={compoundTargetName}
     match={match}
     {...props}
     {...data} />
  );
}
