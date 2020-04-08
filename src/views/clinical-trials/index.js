import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import searchQuery from './query.gql';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import setTitle from '../../utils/set-title';

import ClinicalTrialTable from './clinical-trial-table';
import style from './style.module.scss';

import {
  compoundShape
} from './prop-types';


class ClinicalTrialInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    qCompoundName: PropTypes.string,
    qCompoundTargetName: PropTypes.string,
    qCategoryName: PropTypes.string,
    compound: compoundShape,
    clinicalTrials: PropTypes.object
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
    setTitle('Search');
    this.props.loading || redirectIfNeeded(this.props);
    let {
      qCompoundTargetName,
      qCompoundName,
      qCategoryName,
      compound,
      compoundTarget,
      loading
    } = this.props;
    const {clinicalTrialGroups} = this;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qCategoryName}`
    );
    const noResult = Object.keys(clinicalTrialGroups).length === 0;
    return <Grid stackable className={style['clinical-trials']}>
      <Grid.Row>
        <InlineSearchBox
         compoundValue={qCompoundName}
         compoundTargetValue={qCompoundTargetName}
         clinicalTrialCategoryValue={qCategoryName}
         onChange={this.handleQueryChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            clinicalTrialCategoryDropdown
          }) => (
            <StatHeader>
              {[
                {
                  title: 'Selection',
                  width: 4,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Category', value: clinicalTrialCategoryDropdown}
                  ]
                },
                {
                  title: 'Results',
                  width: 4,
                  cells: [
                    ...(noResult ? [{
                      label: '',
                      value: <div>No result.</div>
                    }] : []),
                    ...(loading ? [{
                      label: '',
                      value: <Loader active inline size="mini" />
                    }] : []),
                    ...Object.entries(clinicalTrialGroups).map(
                      ([cat, trials]) => ({
                        label: <a href={`#${cat}`}>{cat}</a>,
                        value: trials.length
                      })
                    )
                  ]
                },
                ...(compound || compoundTarget ? [{
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
                  </>,
                  width: 8
                }] : [])
              ]}
            </StatHeader>
          )}
        </InlineSearchBox>
      </Grid.Row>
      {loading ?
        <Loader active inline="centered" /> : <>
          {!noResult ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                {Object.entries(clinicalTrialGroups)
                  .map(([cat, catData], idx) => [
                    <Header
                     key={`h${idx}`}
                     as="h2" dividing id={cat}>{cat}</Header>,
                    <ClinicalTrialTable
                     key={`t${idx}`}
                     cacheKey={`${cacheKey}@@${cat}`}
                     data={catData} />
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
      compoundName, compoundTargetName, categoryName,
      withCompound: Boolean(compoundName),
      withCompoundTarget: Boolean(compoundTargetName)
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
