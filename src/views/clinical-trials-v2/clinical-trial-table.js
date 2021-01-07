import React from 'react';
import {Link} from 'found';
import moment from 'moment';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import escapeRegExp from 'lodash/escapeRegExp';
import {Popup} from 'semantic-ui-react';

import SimpleTable, {
  ColumnDef as ColDef
} from 'sierra-frontend/dist/components/simple-table';
import TrialLink from '../../components/clinical-trial-link';
import style from './style.module.scss';

function monthYear(date) {
  date = moment(date);
  if (date.isValid()) {
    return date.format("MMM 'YY");
  }
  return '-';
}

function shortenCompound(name) {
  return (
    name
      .replace(/Hydroxychloroquine/g, 'HCQ')
      .replace(/Chloroquine/g, 'CQ')
      .replace(/Lopinavir\/r/g, 'LPV/r')
      .replace(/Convalescent plasma/g, 'CP')
      .replace(/Azithromycin/g, 'AZ')
  );
}

function renderIntervention(
  text, {compoundSplitter, compoundDescMap, compoundNormMap}
) {
  const splitted = text.split(compoundSplitter);
  const result = [];
  const appeared = [];
  for (let i = 0; i < splitted.length; i ++) {
    if (i % 4 !== 2) {
      // not a compound
      result.push(splitted[i]);
    }
    else {
      // a compound
      const lower = splitted[i].toLocaleLowerCase();
      const compoundName = compoundNormMap[lower];
      const norm = <Link className="header" to={{
        pathname: '/search/',
        query: {compound: compoundName}
      }}>
        {compoundName}
      </Link>;
      const shorted = shortenCompound(splitted[i]);
      if (appeared.indexOf(norm) > -1) {
        result.push(shorted);
      }
      else {
        appeared.push(norm);
        const desc = compoundDescMap[lower];
        result.push(
          <Popup
           key={i}
           hoverable
           header={norm}
           content={desc}
           trigger={<span className={style['with-info']}>
             {shorted}
           </span>} />
        );
      }
    }
  }
  if (result[result.length - 1] === ' ') {
    result.pop();
  }
  return result;
}

function renderRegion(region, {regionDetail}) {
  if (regionDetail) {
    return <Popup content={regionDetail} trigger={<span>{region}</span>} />;
  }
  else {
    return region;
  }
}

function renderRecruitmentStatus(status, {attachedTextObjs}) {
  // const recruitment = [
  //   "Recruiting", "Suspended",
  //   "Terminated", "Completed"].includes(status) ? status : '-';

  let stop_reason = '';
  for (const one of attachedTextObjs) {
    if (one.type === 'stop_reason') {
      stop_reason = one.content;
    }
  }
  if (stop_reason) {
    return <Popup content={stop_reason} trigger={<span>{status}</span>} />;
  } else {
    return status;
  }
}

function renderArticle(articles) {
  return <>
    {articles.map(({nickname}, idx) => {
      const url = `/search/?article=${nickname}`;
      return (
        <span key={idx}>
          <Link to={url}>{nickname}</Link>
          {idx < (articles.length - 1) ? '; ': null}
        </span>
      );
    })}
  </>;
}

const tableColumns = [
  new ColDef({
    name: 'trialNumbers', label: 'Trial Number',
    render: tns => (
      tns.map((tn, idx) => (
        <div
         className={style['trial-number']}
         key={idx}><TrialLink number={tn} /></div>
      ))
    )
  }),
  /*new ColDef({
    name: 'hasTreatmentGroup',
    label: <>Treatment /<br />Prevention</>,
    render: (hasT, {hasPreventionGroup: hasP}) => (
      hasT && hasP ? 'Both' : (
        hasT ? 'Treatment' : (
          hasP ? 'Prevention' : '?'
        )
      )
    ),
    sortable: false
  }),*/
  new ColDef({
    name: 'treatmentPopulation',
    label: 'Population'
  }),
  new ColDef({
    name: 'intervention',
    render: renderIntervention
  }),
  new ColDef({
    name: 'region',
    label: 'Country',
    render: renderRegion
  }),
  new ColDef({
    name: 'numParticipants',
    label: 'Planned #'
  }),
  new ColDef({
    name: 'startDate',
    label: 'Est. Start',
    render: monthYear
  }),
  new ColDef({
    name: 'recruitmentStatus', label: 'Status',
    render: renderRecruitmentStatus
  }),
  new ColDef({
    name: 'articles',
    label: 'Publication',
    render: renderArticle,
  }),
];


function getCompoundSplitter(compounds) {
  return new RegExp(`(^|[\\s()])(${
    orderBy(
      compounds.edges
        .reduce(
          (acc, {node: {name, synonyms}}) => ([...acc, name, ...synonyms]),
          []
        )
        .map(escapeRegExp),
      [({length}) => length, n => n],
      ['desc']
    ).join('|')
  })($|[\\s()])`, 'gi');
}


function getCompoundDescMap(compounds) {
  return (
    compounds.edges
      .reduce(
        (acc, {node: {name, synonyms, description}}) => {
          acc[name.toLocaleLowerCase()] = description;
          for (const syn of synonyms) {
            acc[syn.toLocaleLowerCase()] = description;
          }
          return acc;
        }, {}
      )
  );
}


function getCompoundNormMap(compounds) {
  return (
    compounds.edges
      .reduce(
        (acc, {node: {name, synonyms}}) => {
          acc[name.toLocaleLowerCase()] = name;
          for (const syn of synonyms) {
            acc[syn.toLocaleLowerCase()] = name;
          }
          return acc;
        }, {}
      )
  );
}


export default class ClinicalTrialTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    compounds: PropTypes.object.isRequired,
    data: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired
  }

  render() {
    let {cacheKey, data, compounds} = this.props;

    data = orderBy(
      data, [
        function(o) {
          if (o['recruitmentStatus'] === 'Published') {
            return 1;
          } else if (o['recruitmentStatus'] === 'Completed') {
            return 2;
          } else if (o['recruitmentStatus'] === 'Active') {
            return 3;
          } else if (o['recruitmentStatus'] === 'Pending') {
            return 4;
          } else if (o['recruitmentStatus'] === 'Delayed') {
            return 5;
          } else {
            return 6;
          }
        }, function(o) {
          return - o['numPatients'];
        }
      ]
    );
    const compoundSplitter = getCompoundSplitter(compounds);
    const compoundDescMap = getCompoundDescMap(compounds);
    const compoundNormMap = getCompoundNormMap(compounds);
    window.compoundSplitter = compoundSplitter;

    data = data.map(d => ({
      ...d, compoundSplitter, compoundDescMap, compoundNormMap
    }));
    return (
      <SimpleTable
       cacheKey={cacheKey}
       columnDefs={[...tableColumns]}
       data={data} />
    );
  }

}
