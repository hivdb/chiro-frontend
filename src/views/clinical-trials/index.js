import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import ReactMarkdown from 'react-markdown';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import searchQuery from './query.gql';

import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import setTitle from '../../utils/set-title';

import ClinicalTrialTable from './clinical-trial-table';
import style from './style.module.scss';

import {
  compoundShape
} from './prop-types';


function renderCategory(displayName) {
  return <ReactMarkdown
   renderers={{
     paragraph: ({children}) => <>{children}</>
   }}
   source={displayName}
   escapeHtml={false} />;
}


class ClinicalTrialInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    qCompoundName: PropTypes.string,
    qCompoundTargetName: PropTypes.string,
    qCategoryName: PropTypes.string,
    compound: compoundShape,
    clinicalTrials: PropTypes.object,
    clinicalTrialCategories: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  handleQueryChange = (value, category) => (
    handleQueryChange(value, category, this.props)
  )

  get clinicalTrialGroups() {
    const {loading, clinicalTrials, qCategoryName} = this.props;
    if (loading) {
      return {};
    }
    const allTrials = [];
    for (const {node: {categoryNames, ...trial}} of clinicalTrials.edges) {
      for (const categoryName of categoryNames) {
        allTrials.push({...trial, categoryName});
      }
    }
    let result = groupBy(allTrials, t => t.categoryName);
    if (qCategoryName) {
      const tmpResult = {};
      tmpResult[qCategoryName] = result[qCategoryName];
      result = tmpResult;
    }
    return result;
  }

  render() {
    setTitle('Clinical Trials');
    this.props.loading || redirectIfNeeded(this.props);
    let {
      qCompoundTargetName,
      qCompoundName,
      qCategoryName,
      loading,
      clinicalTrialCategories
    } = this.props;
    const {clinicalTrialGroups} = this;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qCategoryName}`
    );
    const noResult = Object.keys(clinicalTrialGroups).length === 0;
    return <Grid stackable className={style['clinical-trials']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>
            Ongoing and Planned Clinical Trials of Antiviral Compounds
            <Header.Subheader>
              from ClinicalTrials.gov and WHO ICTRP
            </Header.Subheader>
          </Header>
          {loading ? <Loader active inline="centered" /> : <>
            {noResult ? <div>No result.</div> : (
              <ul className={style['category-stat']}>
                {clinicalTrialCategories.edges.map(
                  ({node: {name, displayName}}, idx) => (
                    <li key={idx}>
                      <a href={`#${name}`}>
                        {renderCategory(displayName)}
                      </a>
                      <span>{(clinicalTrialGroups[name] || []).length}</span>
                    </li>
                  )
                )}
              </ul>
            )}
          </>}
        </Grid.Column>
      </Grid.Row>
      {loading ?
        <Loader active inline="centered" /> : <>
          {!noResult ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                {clinicalTrialCategories.edges
                  .map(({node: {name, displayName}}, idx) => [
                    <Header
                     key={`h${idx}`}
                     as="h2" dividing id={name}>
                      {renderCategory(displayName)}
                    </Header>,
                    <ClinicalTrialTable
                     key={`t${idx}`}
                     cacheKey={`${cacheKey}@@${name}`}
                     data={clinicalTrialGroups[name]} />
                ])}
              </Grid.Column>
            </Grid.Row> : null
          }
        </>
      }
    </Grid>;
  }

}


export default function ClinicalTrial({match, ...props}) {
  const {
    location: {
      query: {
        compound: compoundName,
        target: compoundTargetName,
        trialcat: categoryName
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchQuery, {
    variables: {
      compoundName, compoundTargetName, categoryName
    }
  });
  if (loading) {
    // return <Loader active inline="centered" />;
    return (
      <ClinicalTrialInner
       qCompoundName={compoundName}
       qCompoundTargetName={compoundTargetName}
       qCategoryName={categoryName}
       match={match}
       loading
       {...props} />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <ClinicalTrialInner
     qCompoundName={compoundName}
     qCompoundTargetName={compoundTargetName}
     qCategoryName={categoryName}
     match={match}
     {...props}
     {...data} />
  );
}
