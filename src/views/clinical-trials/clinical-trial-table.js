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
import style from './style.module.scss';

function monthYear(date) {
  date = moment(date);
  if (date.isValid()) {
    return date.format("MMM 'YY");
  }
  return '-';
}

function trialNumber(number) {
  let url;
  if (number.startsWith('NCT')) {
    url = `https://clinicaltrials.gov/ct2/show/${number}`;
  }
  else if (number.startsWith('ISRCTN')) {
    url = `https://www.isrctn.com/${number}`;
  }
  else if (number.startsWith('EUCTR')) {
    url = (
      'https://www.clinicaltrialsregister.eu/ctr-search/trial/' +
      number.replace(/^EUCTR/, '').replace(/-([^-]+)$/, '/$1')
    );
  }
  else if (number.startsWith('JPRN-')) {
    url = (
      'https://rctportal.niph.go.jp/en/detail?trial_id=' +
      encodeURIComponent(number.slice(5))
    );
  }
  else if (number.startsWith('ChiCTR')) {
    url = (
      'http://www.chictr.org.cn/searchprojen.aspx?regno=' +
      encodeURIComponent(number) +
      '&title=&officialname=&subjectid=&secondaryid=' +
      '&applier=&studyleader=&ethicalcommitteesanction=' +
      '&sponsor=&studyailment=&studyailmentcode=&studytype=0' +
      '&studystage=0&studydesign=0&minstudyexecutetime=' +
      '&maxstudyexecutetime=&recruitmentstatus=0&gender=0' +
      '&agreetosign=&secsponsor=&regstatus=0&country=' +
      '&province=&city=&institution=&institutionlevel=' +
      '&measure=&intercode=&sourceofspends=&createyear=0' +
      '&isuploadrf=&whetherpublic=&btngo=btn&verifycode=&page=1'
    );
  }
  else if (number.startsWith('IRCT')) {
    url = `https://en.irct.ir/search/result?query=${number}`;
  }
  else if (number.startsWith('ACTRN')) {
    url = `https://apps.who.int/trialsearch/Trial2.aspx?TrialID=${number}`;
  }
  else if (number.startsWith('NL')) {
    url = 'https://www.trialregister.nl/trial/' + number.replace(/^NL/, '');
  }
  else if (number.startsWith('RPCEC')) {
    url = `http://registroclinico.sld.cu/en/trials/${number}-en`;
  }
  if (url) {
    return (
      <a href={url} rel="noopener noreferrer" target="_blank">{number}</a>
    );
  }
  return number;
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
  const recruitment = [
    "Recruiting", "Suspended",
    "Terminated", "Completed"].includes(status) ? status : '-';

  let stop_reason = '';
  for (const one of attachedTextObjs) {
    if (one.type === 'stop_reason') {
      stop_reason = one.content;
    }
  }
  if (stop_reason) {
    return <Popup content={stop_reason} trigger={<span>{recruitment}</span>} />;
  } else {
    return recruitment;
  }
}

const tableColumns = [
  new ColDef({
    name: 'trialNumbers', label: 'Trial Number',
    render: tns => (
      tns.map((tn, idx) => (
        <div
         className={style['trial-number']}
         key={idx}>{trialNumber(tn)}</div>
      ))
    )
  }),
  new ColDef({
    name: 'recruitmentStatus', label: 'Status',
    render: renderRecruitmentStatus
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
    name: 'stopDate',
    label: 'Est. Stop',
    render: monthYear
  })
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
      data, ['recruitmentStatus', 'numParticipants'], ['desc', 'desc']
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
