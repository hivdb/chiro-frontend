import React from 'react';
import PropTypes from 'prop-types';
import {Link, useRouter} from 'found';
import {useQuery} from '@apollo/client';
import {TiDelete} from '@react-icons/all-files/ti/TiDelete';

import {buildLocationQuery} from '../hooks/location-params';

import articleQuery from './search.gql';
import style from './style.module.scss';


function initials(name) {
  if (!name) {
    return '';
  }
  name = name.split(/ /g);
  return name.map(n => n.slice(0, 1)).join('');
}


function formatAuthors(authors) {
  const authorList = authors.map(
    ({surname, givenNames}) => `${surname} ${initials(givenNames)}`
  );
  let [senior, ...others] = authorList.reverse();
  others = others.reverse();
  if (authors.length > 1) {
    return `${others.join(', ')}, and ${senior}`;
  }
  else { // authors.length === 1
    return senior;
  }
}


export function normTitle(text) {
  if (text) {
    return text.trim().replace(/\.$/, '');
  }
  return text;
}


export default function ArticleCard({refName}) {

  let {
    loading,
    error,
    data
  } = useQuery(articleQuery, {
    variables: {
      articleNickname: refName
    },
    skip: !refName
  });

  const {match: {location: loc}} = useRouter();

  if (error) {
    console.error(`ArticleCard: ${error}`);
    return null;
  }

  if (!refName) {
    return null;
  }

  const {
    authors = [],
    title,
    journal,
    year,
    doi = [],
    pmid = [],
    pmcid = []
  } = data?.article || {};

  return (
    <section
     data-loaded={!loading && !!data?.article}
     className={style['article-card']}>
      <div className={style['action']}>
        <Link
         className={style['remove']}
         to={{
           pathname: loc.pathname,
           query: buildLocationQuery('article', undefined, loc.query)
         }}><TiDelete/>
        </Link>
      </div>
      <div className={style['journal-year']}>
        {journal} ({year})
      </div>
      <div className={style['title']}>{normTitle(title)}</div>
      <div className={style['authors']}>{formatAuthors(authors)}</div>
      <ul className={style['extids']}>
        {doi.length > 0 ? <li className={style['extid']}>
          DOI:{' '} <a
           href={`https://doi.org/${doi[0]}`}
           rel="noreferrer"
           target="_blank">
            {doi[0]}
          </a>
        </li> : null}
        {pmid.length > 0 ? <li className={style['extid']}>
          {' '}PMID: <a
           href={`https://www.ncbi.nlm.nih.gov/pubmed/${pmid[0]}/`}
           rel="noreferrer"
           target="_blank">{pmid[0]}</a>
        </li> : null}
        {pmcid.length > 0 ? <li className={style['extid']}>
          {' '}PMCID: <a
           href={`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcid[0]}/`}
           rel="noreferrer"
           target="_blank">PMC{pmcid[0]}</a>
        </li> : null}
      </ul>
    </section>
  );
}


ArticleCard.propTypes = {
  refName: PropTypes.string
};
