import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import AnimalExpTable from './animal-experiments';
import EntryAssayExpTable from './entry-assay-experiment';
import ClinicalExpTable from './clinical-experiments';
import searchQuery from './search.gql';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';

import ArticleInfo from './article-info';
import style from './style.module.scss';

import {
  compoundShape,
  virusExperimentsShape,
  entryAssayExperimentsShape,
  biochemExperimentsShape,
  animalExperimentsShape
} from './prop-types';


class SearchInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    qCompoundName: PropTypes.string,
    qVirusName: PropTypes.string,
    qCompoundTargetName: PropTypes.string,
    qArticleNickname: PropTypes.string,
    qStudyType: PropTypes.string,
    compound: compoundShape,
    virusExperiments: virusExperimentsShape,
    biochemExperiments: biochemExperimentsShape,
    animalExperiments: animalExperimentsShape,
    entryAssayExperiments: entryAssayExperimentsShape,
  }

  static defaultProps = {
    loading: false
  }

  handleQueryChange = (value, category) => (
    handleQueryChange(value, category, this.props)
  )

  render() {
    this.props.loading || redirectIfNeeded(this.props);
    let {
      qCompoundTargetName,
      qCompoundName,
      qVirusName,
      qArticleNickname,
      qStudyType,
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
      `@@${qVirusName}@@${qArticleNickname}@@${qStudyType}`
    );
    if (qStudyType) {
      if (qStudyType !== 'invitro-cells') {
        virusExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'invitro-entryassay') {
        entryAssayExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'invitro-biochem') {
        biochemExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'animal-models') {
        animalExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'clinical-studies') {
        clinicalExperiments = {totalCount: 0, edges: []};
      }
    }
    const noResult = !loading && (
      virusExperiments.totalCount +
      entryAssayExperiments.totalCount +
      biochemExperiments.totalCount +
      animalExperiments.totalCount +
      clinicalExperiments.totalCount
    ) === 0;
    return <Grid stackable className={style['search']}>
      <Grid.Row>
        <InlineSearchBox
         articleValue={qArticleNickname}
         compoundValue={qCompoundName}
         virusValue={qVirusName}
         compoundTargetValue={qCompoundTargetName}
         studyTypeValue={qStudyType}
         onChange={this.handleQueryChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown,
            studyTypeDropdown,
          }) => (
            <StatHeader>
              {[
                {
                  title: 'Selection',
                  width: 3,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown},
                    {label: 'Study type', value: studyTypeDropdown},
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
                        Cell culture
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
                      {compound.targetObj ?
                        compound.targetObj.description || 'Pending.' :
                        null}
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


export default function Search({match, ...props}) {
  const {
    location: {
      query: {
        compound: compoundName,
        virus: virusName,
        target: compoundTargetName,
        article: articleNickname,
        study: studyType
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchQuery, {
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
      <SearchInner
       qCompoundName={compoundName}
       qVirusName={virusName}
       qArticleNickname={articleNickname}
       qCompoundTargetName={compoundTargetName}
       qStudyType={studyType}
       match={match}
       loading
       {...props} />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <SearchInner
     qCompoundName={compoundName}
     qVirusName={virusName}
     qArticleNickname={articleNickname}
     qCompoundTargetName={compoundTargetName}
     qStudyType={studyType}
     match={match}
     {...props}
     {...data} />
  );
}
