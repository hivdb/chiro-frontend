import React from 'react';
import PropTypes from 'prop-types';
import {Link, matchShape} from 'found';
import {useQuery} from '@apollo/react-hooks';
import {Grid, Header, Loader} from 'semantic-ui-react';

import VirusExpTable from './virus-experiments';
import BiochemExpTable from './biochem-experiments';
import AnimalExpTable from './animal-experiments';
import FusionAssayExpTable from './fusion-assay-experiments';
import PseudovirusExpTable from './pseudovirus-experiments';
import ClinicalExpTable from './clinical-experiments';
import searchQuery from './search.gql';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import ArticleInfo from '../../components/article-info';
import BackToTop from '../../components/back-to-top';
import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import setTitle from '../../utils/set-title';

import style from './style.module.scss';

import {
  compoundShape,
  virusExperimentsShape,
  fusionAssayExperimentsShape,
  biochemExperimentsShape,
  animalExperimentsShape
} from './prop-types';


class SearchInner extends React.Component {

  static propTypes = {
    formOnly: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    qCompoundName: PropTypes.string,
    qVirusName: PropTypes.string,
    qCompoundTargetName: PropTypes.string,
    qArticleNickname: PropTypes.string,
    qStudyType: PropTypes.string,
    compound: compoundShape,
    virusExperiments: virusExperimentsShape,
    biochemExperiments: biochemExperimentsShape,
    animalExperiments: animalExperimentsShape,
    fusionAssayExperiments: fusionAssayExperimentsShape,
  }

  static defaultProps = {
    formOnly: false,
    loading: false
  }

  handleQueryChange = (actions) => (
    handleQueryChange(actions, this.props)
  )

  render() {
    setTitle('Search');
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
      fusionAssayExperiments,
      pseudovirusExperiments,
      biochemExperiments,
      animalExperiments,
      clinicalExperiments,
      clinicalTrials,
      formOnly,
      loading
    } = this.props;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qVirusName}@@${qArticleNickname}@@${qStudyType}`
    );
    if (qArticleNickname) {
      clinicalTrials = {totalCount: 0};
    }
    if (qVirusName) {
      if (qVirusName !== 'SARS-CoV-2') {
        clinicalTrials = {totalCount: 0};
      }
    }
    if (qStudyType) {
      if (qStudyType !== 'invitro-cells') {
        virusExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'invitro-fusionassay') {
        fusionAssayExperiments = {totalCount: 0, edges: []};
      }
      if (qStudyType !== 'invitro-pseudovirus') {
        pseudovirusExperiments = {totalCount: 0, edges: []};
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
      clinicalTrials = {totalCount: 0};
    }
    const noResult = !formOnly && !loading && (
      virusExperiments.totalCount +
      fusionAssayExperiments.totalCount +
      pseudovirusExperiments.totalCount +
      biochemExperiments.totalCount +
      animalExperiments.totalCount +
      clinicalExperiments.totalCount
    ) === 0;
    const virusMAbCount = virusExperiments ? (
      virusExperiments.edges.filter(({
        node: {categoryName, compoundObjs}
      }) => (
        categoryName === 'CellCulture' &&
        compoundObjs.some(
          ({target}) => target === 'Monoclonal antibody'
        )
      )).length
    ) : 0;
    const virusIFNCount = virusExperiments ? (
      virusExperiments.edges.filter(({
        node: {categoryName}
      }) => (
        categoryName === 'CellCultureIFN'
      )).length
    ) : 0;
    const pseudovirusMAbCount = pseudovirusExperiments ? (
      pseudovirusExperiments.edges.filter(({
        node: {categoryName, compoundObjs}
      }) => (
        compoundObjs.some(
          ({target}) => target === 'Monoclonal antibody'
        )
      )).length
    ) : 0;
    return <Grid stackable className={style['search']}>
      <Grid.Row>
        <InlineSearchBox
         articleValue={formOnly ? null : qArticleNickname}
         compoundValue={formOnly ? null : qCompoundName}
         virusValue={formOnly ? null : qVirusName}
         compoundTargetValue={formOnly ? null : qCompoundTargetName}
         studyTypeValue={formOnly ? null : qStudyType}
         placeholder={'Select item'}
         compoundPlaceholder={'Enter text or select item'}
         onChange={this.handleQueryChange}
         allowEmpty>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown,
            studyTypeDropdown,
          }) => (
            <StatHeader>
              {[
                {
                  className: style['search-box'],
                  width: 4,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown},
                    {label: 'Study type', value: studyTypeDropdown},
                  ]
                },
                {
                  width: 12,
                  className: style['search-summary'],
                  description: formOnly ? <>
                    <Header as="h1" dividing>Database Search</Header>
                    <p>
                      Select an option from left drop down
                      lists to start searching.
                    </p>
                  </> : <>
                    {compound || virus || compoundTarget ? <>
                      {compoundTarget && !compound ? <>
                        <Header as="h2" dividing>
                          Target: {compoundTarget.name}
                        </Header>
                        <p>{compoundTarget.description || 'Pending.'}</p>
                      </> : null}
                      {compound ? <>
                        <Header as="h2" dividing>
                          Target: {compound.targetObj.name}
                        </Header>
                        <p>{compound.targetObj ?
                          compound.targetObj.description || 'Pending.' :
                          null}</p>
                      </> : null}
                      {compound ? <>
                        <Header as="h2" dividing>
                          Compound: {compound.name}
                        </Header>
                        <p>{compound.description || 'Pending.'}</p>
                      </> : null}
                      {virus ? <>
                        <Header as="h2" dividing>
                          Virus: {virus.name}
                        </Header>
                        <p>{virus.description || 'Pending.'}</p>
                      </> : null}
                    </> : null}
                    {!compound && !virus && !compoundTarget && article ?
                      <ArticleInfo {...article} /> : null}
                    {noResult ? null : <>
                      <Header as="h2" dividing>
                        Results
                      </Header>
                      <ul>
                        {!loading && virusExperiments.totalCount > 0 ? <li>
                          <a href="#invitro-cells" className={style['label']}>
                            Cell culture
                          </a>
                          {virusExperiments.totalCount}
                          {virusMAbCount + virusIFNCount > 0 ?
                            <ul>
                              {virusMAbCount > 0 ?
                                <li>
                                  <a
                                   href="#monoclonal-antibodies"
                                   className={style['label']}>
                                    Monoclonal antibodies
                                  </a>
                                  {virusMAbCount}
                                </li> : null}
                              {virusIFNCount > 0 ?
                                <li>
                                  <a
                                   href="#interferons"
                                   className={style['label']}>
                                    Interferons
                                  </a>
                                  {virusIFNCount}
                                </li> : null}
                            </ul> : null}
                        </li> : null}
                        {!loading &&
                          fusionAssayExperiments.totalCount > 0 ? <li>
                            <a
                             href="#invitro-fusionassay"
                             className={style['label']}>
                              Fusion assay
                            </a>
                            {fusionAssayExperiments.totalCount}
                          </li> : null}
                        {(
                          !loading && pseudovirusExperiments.totalCount > 0
                        ) ? <li>
                          <a href="#pseudovirus" className={style['label']}>
                            Pseudovirus
                          </a>
                          {pseudovirusExperiments.totalCount}
                          {pseudovirusMAbCount > 0 ?
                            <ul>
                              <li>
                                <a
                                 href="#monoclonal-antibodies-pseudovirus"
                                 className={style['label']}>
                                  Monoclonal antibodies
                                </a>
                                {pseudovirusMAbCount}
                              </li>
                            </ul> : null}
                        </li> : null}
                        {!loading && biochemExperiments.totalCount > 0 ? <li>
                          <a href="#invitro-biochem" className={style['label']}>
                            Biochemistry
                          </a>
                          {biochemExperiments.totalCount}
                        </li> : null}
                        {!loading && animalExperiments.totalCount > 0 ? <li>
                          <a href="#animal-models" className={style['label']}>
                            Animal models
                          </a>
                          {animalExperiments.totalCount}
                        </li> : null}
                        {!loading && clinicalExperiments.totalCount > 0 ? <li>
                          <a
                           href="#clinical-studies"
                           className={style['label']}>
                            Clinical studies
                          </a>
                          {clinicalExperiments.totalCount}
                        </li> : null}
                        {!loading && clinicalTrials.totalCount > 0 ? <li>
                          <Link to={{
                            pathname: '/clinical-trials/',
                            query: {
                              compound: qCompoundName,
                              target: qCompoundTargetName
                            }
                          }} className={style['label']}>
                            Clinical trials
                          </Link>
                          {clinicalTrials.totalCount}
                        </li> : null}
                      </ul>
                    </>}
                  </>
                },
              ]}
            </StatHeader>
          )}
        </InlineSearchBox>
      </Grid.Row>
      {formOnly || loading ?
        (loading ? <Loader active inline="centered" /> : null) : <>
          {noResult ? <div>No result.</div> : null}
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
          {fusionAssayExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column withd={16}>
                <Header as="h2" dividing id="invitro-fusionassay">
                  Fusion Assay
                </Header>
                <FusionAssayExpTable
                 cacheKey={cacheKey}
                 data={fusionAssayExperiments} />
              </Grid.Column>
            </Grid.Row> : null}
          {pseudovirusExperiments.totalCount > 0 ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                <Header as="h2" dividing id="pseudovirus">
                  Pseudovirus
                </Header>
                <PseudovirusExpTable
                 cacheKey={cacheKey}
                 data={pseudovirusExperiments} />
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
      <BackToTop />
    </Grid>;
  }

}


export default function Search({match, ...props}) {
  const {
    location: {
      query: {
        form_only: formOnly,
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
      withCompound: !!compoundName,
      withVirus: !!virusName,
      withCompoundTarget: !!compoundTargetName,
      withArticle: !!articleNickname,
      enableQuery: formOnly === undefined
    }
  });
  if (loading) {
    props = {};
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
     loading={loading}
     formOnly={formOnly !== undefined}
     {...props}
     {...data} />
  );
}
