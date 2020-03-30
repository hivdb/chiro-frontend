import React from 'react';
import defer from 'lodash/defer';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import AnimalExpTable from './animal-experiments';
import EntryAssayExpTable from './entry-assay-experiment';
import ClinicalExpTable from './clinical-experiments';
import searchResultQuery from './search-result.gql';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import Breadcrumb from '../../components/breadcrumb';

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
      },
      compound
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
        if (value && compound && value !== compound.target) {
          delete newQuery.compound;
        }
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
      {[
        {linkTo: '/', label: 'Home'},
        {linkTo: '/search/', label: 'Experiment Search'},
        {active: true, label: `Search ${searches}`}
      ]}
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
      compoundTarget,
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
    const noResult = !loading && (
      virusExperiments.totalCount +
      entryAssayExperiments.totalCount +
      biochemExperiments.totalCount +
      animalExperiments.totalCount +
      clinicalExperiments.totalCount
    ) === 0;
    return <Grid stackable className={style['search-result']}>
      {/*this.renderBreadcrumb()*/}
      <Grid.Row>
        <InlineSearchBox
         articleValue={qArticleNickname}
         compoundValue={qCompoundName}
         virusValue={qVirusName}
         compoundTargetValue={qCompoundTargetName}
         onChange={this.handleQueryChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown
          }) => (
            <StatHeader>
              {[
                {
                  title: 'Selection',
                  width: 3,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown}
                  ]
                },
                {
                  title: 'Results',
                  width: 3,
                  cells: [
                    ...(noResult ? [{
                      label: '',
                      value: <div>No result.</div>
                    }] : []),
                    ...(loading ? [{
                      label: '',
                      value: <Loader active inline size="mini" />
                    }] : []),
                    ...(!loading && virusExperiments.totalCount > 0 ? [{
                      label: <a href="#invitro-cells">
                        Cell Culture
                      </a>,
                      value: virusExperiments.totalCount
                    }] : []),
                    ...(!loading && entryAssayExperiments.totalCount > 0 ? [{
                      label: <a href="#invitro-entryassay">
                        Entry assay
                      </a>,
                      value: entryAssayExperiments.totalCount
                    }] : []),
                    ...(!loading && biochemExperiments.totalCount > 0 ? [{
                      label: <a href="#invitro-biochem">
                        Biochemistry
                      </a>,
                      value: biochemExperiments.totalCount
                    }] : []),
                    ...(!loading && animalExperiments.totalCount > 0 ? [{
                      label: <a href="#animal-models">
                        Animal models
                      </a>,
                      value: animalExperiments.totalCount
                    }] : []),
                    ...(!loading && clinicalExperiments.totalCount > 0 ? [{
                      label: <a href="#clinical-studies">
                        Clinical studies
                      </a>,
                      value: clinicalExperiments.totalCount
                    }] : [])
                  ]
                },
                ...(compound || virus || compoundTarget ? [{
                  description: <>
                    {compoundTarget && !compound ? <p>
                      <strong>Target</strong>:{' '}
                      {compoundTarget.description || 'Pending.'}
                    </p> : null}
                    {compound ? <p>
                      <strong>Target</strong>:{' '}
                      {compound.targetObj.description || 'Pending.'}
                    </p> : null}
                    {compound ? <p>
                      <strong>Compound</strong>:{' '}
                      {compound.description || 'Pending.'}
                    </p> : null}
                    {virus ? <p>
                      <strong>Virus</strong>:{' '}
                      {virus.description || 'Pending.'}
                    </p> : null}
                  </>,
                  width: 10
                }] : []),
                ...(!compound && !virus && !compoundTarget && article ? [{
                  description: <ArticleInfo {...article} />,
                  width: 10
                }] : [])
              ]}
            </StatHeader>
          )}
        </InlineSearchBox>
      </Grid.Row>
      {loading ?
        <Loader active inline="centered" /> : <>
          {virusExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                <Header as="h2" dividing id="invitro-cells">
                  Cell Culture
                </Header>
                <VirusExpTable
                 cacheKey={cacheKey}
                 data={virusExperiments} />
              </Grid.Column>
            </Grid.Row> : null}
          {noResult ? <div>No result.</div> : null}
          {entryAssayExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column withd={16}>
                <Header as="h2" dividing id="invitro-entryassay">
                  Entry Assay
                </Header>
                <EntryAssayExpTable
                 cacheKey={cacheKey}
                 data={entryAssayExperiments} />
              </Grid.Column>
            </Grid.Row> : null}
          {biochemExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                <Header as="h2" dividing id="invitro-biochem">
                  Biochemistry
                </Header>
                <BiochemExpTable
                 cacheKey={cacheKey}
                 data={biochemExperiments} />
              </Grid.Column>
            </Grid.Row> : null}
          {animalExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                <Header as="h2" dividing id="animal-models">
                  Animal Models
                </Header>
                <AnimalExpTable
                 cacheKey={cacheKey}
                 data={animalExperiments} />
              </Grid.Column>
            </Grid.Row> : null}
          {clinicalExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                <Header as="h2" dividing id="clinical-studies">
                  Cinical Studies
                </Header>
                <ClinicalExpTable
                 cacheKey={cacheKey}
                 data={clinicalExperiments} />
              </Grid.Column>
            </Grid.Row> : null
          }
        </>
      }
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
