import React from 'react';
import PropTypes from 'prop-types';


function initials(name) {
  if (!name) {
    return '';
  }
  name = name.split(/ /g);
  return name.map(n => n.slice(0, 1)).join('');
}


function etInt(authors) {
  /* Sergei A. Grando and Jeffrey D. Bernhard. "First Author, Second Author,
   * et Int, and Last Author": A Proposed Citation System for Biomedical
   * Papers. Science Editor 26(4):122–123, July–August 2003.
   */
  const authorList = authors.map(
    ({surname, givenNames}) => `${surname} ${initials(givenNames)}`
  );
  let [senior, ...others] = authorList.reverse();
  others = others.reverse().slice(0, 2);
  if (authors.length > 3) {
    return `${others.join(', ')}, et int., and ${senior}`;
  }
  else if (authors.length > 1) {
    return `${others.join(', ')}, and ${senior}`;
  }
  else { // authors.length === 1
    return senior;
  }
}


function normTitle(text) {
  if (text) {
    return text.trim().replace(/\.$/, '');
  }
  return text;
}


export default function ArticleInfo({
  pmid, pmcid, doi,
  title, journal, authors, year
}) {
    
  return <>
    {etInt(authors)}. “{normTitle(title)}.” <em>{journal}</em>, {year}.
    {doi.length > 0 ? <>
      {' '}<a
       href={`https://doi.org/${doi[0]}`}
       rel="noopener noreferrer"
       target="_blank">doi.org/{doi[0]}</a>.
    </> : null}
    {pmid.length > 0 ? <>
      {' '}[<a
       href={`https://www.ncbi.nlm.nih.gov/pubmed/${pmid[0]}/`}
       rel="noopener noreferrer"
       target="_blank">PubMed{pmid[0]}</a>]
    </> : null}
    {pmcid.length > 0 ? <>
      {' '}[<a
       href={`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcid[0]}/`}
       rel="noopener noreferrer"
       target="_blank">PMC{pmcid[0]}</a>]
    </> : null}
  </>;

}

ArticleInfo.propTypes = {
  pmid: PropTypes.array,
  pmcid: PropTypes.array,
  doi: PropTypes.array,
  title: PropTypes.string,
  journal: PropTypes.string,
  authors: PropTypes.array,
  year: PropTypes.number
};
