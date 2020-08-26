import React from 'react';


export default function ClinicalTrialLink({number}) {
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
