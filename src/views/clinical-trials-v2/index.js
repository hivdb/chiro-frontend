import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import {useQuery} from '@apollo/client';
import {matchShape, routerShape} from 'found';
import {Grid, Header, Loader, Button} from 'semantic-ui-react';

import searchQuery from './query.gql';

import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import {getFullLink, loadPage} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import BackToTop from '../../components/back-to-top';
import Modal from '../../components/modal';

import ClinicalTrialTable from './clinical-trial-table';
import style from './style.module.scss';
import {groupTrials2, markDelayed} from './group-trials';

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
    compounds: PropTypes.object,
    compoundTargets: PropTypes.object,
    clinicalTrials: PropTypes.object,
    updateTime: PropTypes.object
  };

  static defaultProps = {
    loading: false
  };

  constructor() {
    super(...arguments);
    this.state = {
      figureCaption: '',
      modal: null
    };
  }

  async componentDidMount() {
    const promise = await loadPage('clinical-trials');
    this.setState({
      figureCaption: promise.figureCaption || '',
      figureACaption: promise.figureACaption || '',
      figureBCaption: promise.figureBCaption || ''
    });
  }

  handleQueryChange = (actions) => (
    handleQueryChange(actions, this.props)
  );

  handleOpenFigure(e) {
    e && e.preventDefault();
    const figureURI = e.target.getAttribute('data-figureuri');
    const figureName = e.target.getAttribute('data-figurename');
    const captionName = e.target.getAttribute('data-figurecaption');
    this.setState({
      modal: <Modal
       onClose={this.handleCloseFigure.bind(this)}
       closeOnBlur={false}>
        <div>
          <img
           className={style['figure-image']}
           src={getFullLink(figureURI)}
           alt="clinical trials totals statistics" />
        </div>
        <p className={style['figure-name']}>{figureName}</p>
        <p>
          {this.state[captionName] || ''}
        </p>
      </Modal>
    });
  }

  handleCloseFigure() {
    this.setState({modal: null});
  }

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
  };

  get clinicalTrialGroups() {
    let {
      loading, clinicalTrials, qCompoundTargetName,
      match: {location: {query: {fromDate}}}
    } = this.props;
    if (loading) {
      return {};
    }

    clinicalTrials = clinicalTrials.edges;

    if (fromDate) {
      fromDate = moment(fromDate);
      if (fromDate.isValid()) {
        clinicalTrials = clinicalTrials.filter((trial) => {
          let {node: {dateEntered}} = trial;
          dateEntered = moment(dateEntered);
          return dateEntered.isSameOrAfter(fromDate);
        });
      }
    }
    let allTrials = markDelayed(clinicalTrials);

    allTrials = groupTrials2(allTrials, qCompoundTargetName);

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

    let tableHeaders = (
      compoundTargets ?
        compoundTargets.edges.map(({node: {name}}) => name) :
        []
    );

    tableHeaders.push('Hydroxychloroquine');

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
                  Last updated on {updateTime.toLocaleString('en-US')}
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
           placeholder={"Select item"}
           compoundTargetValue={qCompoundTargetName}
           compoundListFilter={({title}) => (
             clinicalTrialCompoundList.includes(title)
           )}
           onChange={this.handleExpSearchBoxChange}>
            {({
              compoundTargetDropdown,
              compoundDropdown
            }) => (
              <StatHeader>
                {[
                  {
                    cells: [
                      {label: 'Target', value: compoundTargetDropdown},
                      {label: 'Compound', value: compoundDropdown}
                    ]
                  }
                ]}
              </StatHeader>
            )}
          </InlineSearchBox>
          }
        </Grid.Column>
        <Grid.Column width={8}>
          {loading ? <Loader active inline="centered" /> : <>
            {noResult ? <div>No result.</div> : (
              <ul className={style['category-stat']}>
                {tableHeaders.map(
                  (name, idx) => {
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
        <Grid.Column width={4} className={style['figure-panel']}>
          {loading ? <Loader active inline="centered" /> : <>
            <div className={style['figure-button']}>
              <Button
               type="button"
               data-figureuri={'images/clinical-trials/TargetTotals.png'}
               data-figurename={'Figure A'}
               data-figurecaption={'figureACaption'}
               onClick={this.handleOpenFigure.bind(this)}
               size="medium">Studies of targets</Button>
            </div>
            <div className={style['figure-button']}>
              <Button
               type="button"
               data-figureuri={'images/clinical-trials/DrugTotals.png'}
               data-figurename={'Figure B'}
               data-figurecaption={'figureBCaption'}
               onClick={this.handleOpenFigure.bind(this)}
               size="medium">Studies of compounds</Button>
            </div>
            {this.state.modal}
          </>}
        </Grid.Column>
      </Grid.Row>

      {loading ?
        <Loader active inline="centered" /> : <>
          {!noResult ?
            <Grid.Row centered>
              <Grid.Column width={16}>
                {tableHeaders
                  .map((name, idx) => {
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
                <BackToTop />
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
        trialcat: categoryName,
        no_related_compounds: noRelatedCompounds
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(searchQuery, {
    variables: {
      compoundName,
      compoundTargetName,
      categoryName,
      noRelatedCompounds: !!noRelatedCompounds
    }
  });
  if (loading) {
    // return <Loader active inline="centered" />;
    return (
      <ClinicalTrialInner
       qCompoundName={compoundName}
       qCompoundTargetName={compoundTargetName}
       qCategoryName={categoryName}
       noRelatedCompounds={!!noRelatedCompounds}
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
     noRelatedCompounds={!!noRelatedCompounds}
     match={match}
     {...props}
     {...data} />
  );
}

ClinicalTrial.propTypes = {
  match: matchShape.isRequired
};
