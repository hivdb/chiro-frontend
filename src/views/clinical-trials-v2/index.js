import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import {useQuery} from '@apollo/react-hooks';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader} from 'semantic-ui-react';

import searchQuery from './query.gql';

import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import {getFullLink} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';

import ClinicalTrialTable from './clinical-trial-table';
import style from './style.module.scss';

import {
  compoundShape
} from './prop-types';

const HREF_CT = 'https://clinicaltrials.gov/ct2/results?cond=COVID-19';
const HREF_ICTRP = 'https://www.who.int/ictrp/en/';


class ClinicalTrialInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    qCompoundName: PropTypes.string,
    qCompoundTargetName: PropTypes.string,
    qCategoryName: PropTypes.string,
    compound: compoundShape,
    compounds: PropTypes.object,
    compoundTargets: PropTypes.object,
    clinicalTrials: PropTypes.object,
    clinicalTrialCategories: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  handleQueryChange = (actions) => (
    handleQueryChange(actions, this.props)
  )

  handleExpSearchBoxChange = (actions) => {
    const query = {};
    for (let [value, category] of actions) {
      value = value || undefined;
      if (category === 'compounds') {
        query.compound = value;
      }
      else if (category === 'compoundTargets') {
        query.target = value;
      }
      else {
        query.virus = value;
      }
    }
    this.props.router.push(
      {pathname: '/clinical-trials/', query}
    );
  }

  get clinicalTrialGroups() {
    const {loading, clinicalTrials, qCompoundTargetName} = this.props;
    if (loading) {
      return {};
    }
    let allTrials = [];
    for (const {node: {compoundObjs, ...trial}} of clinicalTrials.edges) {
      let used_target = [];
      for (const {target, primaryCompound, relatedCompounds} of compoundObjs) {
        if (used_target.includes(target)) {
          continue;
        }
        allTrials.push({...trial, target, primaryCompound, relatedCompounds});
        used_target.push(target);
      }
    }
    if (qCompoundTargetName) {
      allTrials = allTrials.filter(({target}) => {
        if (target === qCompoundTargetName) {
          return true;
        } else {
          return false;
        }
      });
    }
    let result = groupBy(allTrials, t => t.target);
    return result;
  }

  get clinicalTrialCompoundList() {
    const {compounds} = this.props;

    if (!compounds) {
      return [];
    }

    return compounds.edges.filter(
      ({node: {clinicalTrialCount}}) => {
        return clinicalTrialCount && parseInt(clinicalTrialCount) > 0;
      }
    ).map(({node: {name}}) => (name));
  }

  render() {
    setTitle('Clinical Trials');
    this.props.loading || redirectIfNeeded(this.props);
    let {
      qCompoundTargetName,
      qCompoundName,
      qCategoryName,
      loading,
      compounds,
      compoundTargets,
      updateTime
    } = this.props;

    const {clinicalTrialGroups, clinicalTrialCompoundList} = this;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qCategoryName}`
    );
    const noResult = Object.keys(clinicalTrialGroups).length === 0;
    if (updateTime) {
      updateTime = new Date(updateTime.updateTime);
    }
    const hasFilter = (
      !!qCompoundTargetName ||
      !!qCompoundName ||
      !!qCategoryName);
    return <Grid stackable className={style['clinical-trials']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>
            Ongoing and Planned Clinical Trials of Antiviral Compounds
            <Header.Subheader>
              from <a href={HREF_CT} rel="noopener noreferrer" target="_blank">
                ClinicalTrials.gov
              </a> and{' '}
              <a href={HREF_ICTRP} rel="noopener noreferrer" target="_blank">
                WHO ICTRP
              </a>
              {updateTime ?
                <span className={style['last-update']}>
                  Last updated at {updateTime.toLocaleString('en-US')}
                </span> : null}
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={4} className={style['search-box']}>
          {loading ? <Loader active inline="centered" /> :
          <InlineSearchBox
           compoundValue={qCompoundName}
           compoundTargetValue={qCompoundTargetName}
           compoundListFilter={({title, category, displayTargets}) => (
            category === 'compounds' &&
            clinicalTrialCompoundList.includes(title) &&
            displayTargets.indexOf(qCompoundTargetName) > -1
          )}
           onChange={this.handleExpSearchBoxChange}>
            {({
              compoundTargetDropdown,
              compoundDropdown,
            }) => (
              <StatHeader>
                {[
                  {
                    cells: [
                      {label: 'Target', value: compoundTargetDropdown},
                      {label: 'Compound', value: compoundDropdown},
                    ]
                  }
                ]}
              </StatHeader>
            )}
          </InlineSearchBox>
          }
        </Grid.Column>
        <Grid.Column width={12}>
          {loading ? <Loader active inline="centered" /> :
          <>
            {noResult ? <div>No result.</div> : (
              <ul className={style['category-stat']}>
                {compoundTargets.edges.map(
                  ({node: {name}}, idx) => {
                    const count = (clinicalTrialGroups[name] || []).length;
                    if (count === 0) {
                      return null;
                    }
                    return <li key={idx}>
                      <a href={`#${name}`}>
                        {name}
                      </a>
                      <span>{count}</span>
                    </li>;
                  }
                )}
              </ul>
            )}
          </>}
        </Grid.Column>
      </Grid.Row>
      {hasFilter ? null : <>
        <Grid.Row>
          <img
           src={getFullLink('images/clinical-trials/TargetTotals.png')}
           alt="target totals" />
        </Grid.Row>
        <Grid.Row>
          <img
           src={getFullLink('images/clinical-trials/DrugTotals.png')}
           alt="drug totals" />
        </Grid.Row>
      </>}

      {loading ?
        <Loader active inline="centered" /> : <>
          {!noResult ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                {compoundTargets.edges
                  .map(({node: {name}}, idx) => {
                    const count = (clinicalTrialGroups[name] || []).length;
                    if (count === 0) {
                      return [];
                    }
                    return [
                      <Header
                       key={`h${idx}`}
                       as="h2" dividing id={name}>
                        {name}
                      </Header>,
                      <ClinicalTrialTable
                       key={`t${idx}`}
                       cacheKey={`${cacheKey}@@${name}`}
                       compounds={compounds}
                       data={clinicalTrialGroups[name]} />
                    ];
                })}
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
