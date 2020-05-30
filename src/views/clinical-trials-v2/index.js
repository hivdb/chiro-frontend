import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import ReactMarkdown from 'react-markdown';
import {useQuery} from '@apollo/react-hooks';
import {Link, matchShape, routerShape} from 'found';
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

const HREF_CT = 'https://clinicaltrials.gov/ct2/results?cond=COVID-19';
const HREF_ICTRP = 'https://www.who.int/ictrp/en/';


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

  get clinicalTrialGroups() {
    const {loading, clinicalTrials} = this.props;
    if (loading) {
      return {};
    }
    const allTrials = [];
    for (const {node: {compoundObjs, ...trial}} of clinicalTrials.edges) {
      for (const {target} of compoundObjs) {
        allTrials.push({...trial, target});
      }
    }
    let result = groupBy(allTrials, t => t.target);
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
      compounds,
      compoundTargets,
      clinicalTrialCategories,
      updateTime
    } = this.props;
    const {clinicalTrialGroups} = this;
    const cacheKey = (
      `${qCompoundTargetName}@@${qCompoundName}` +
      `@@${qCategoryName}`
    );
    const noResult = Object.keys(clinicalTrialGroups).length === 0;
    if (updateTime) {
      updateTime = new Date(updateTime.updateTime);
    }
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

          {loading ? <Loader active inline="centered" /> : <>
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
                    ]
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
