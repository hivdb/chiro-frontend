import React from 'react';
import sortBy from 'lodash/sortBy';
import orderBy from 'lodash/orderBy';
import startCase from 'lodash/startCase';

import style from './style.module.scss';


class ColDef {

  constructor(name, label, render, sort, sortable = true) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === null || cellData === '') ? 'NA' : cellData
    );
    this.sort = sort ? sort : data => sortBy(data, [name]);
    this.sortable = Boolean(sortable);
  }

}


function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }
  const data = expData.edges.map(({node}) => node);
  return orderBy(
    data, [
      row => ((row.articles[0] || {}).year || 0),
      row => ((row.articles[0] || {}).nickname || [''])[0]
    ],
    ['desc', 'asc']
  );
}


function readableNum(num) {
  let prec = Math.max(Math.floor(Math.log10(num)) + 1, 2);
  return num.toPrecision(prec);
}


function renderXX50(num, cmp, unit) {
  if (num === null) {
    return 'NA';
  }
  num = readableNum(num);
  return <span className={style['nowrap']}>
    {cmp === '=' ? '' : cmp}{num} {unit}
  </span>;
}


const authorYearColDef = new ColDef(
  'articles', 'Author/Year',
  articles => articles.map(
    ({nickname, pmid, doi}, idx) => {
      let url;
      if (pmid && pmid.length > 0) {
        url = `https://www.ncbi.nlm.nih.gov/pubmed/${pmid[0]}`;
      }
      else if (doi && doi.length > 0) {
        url = `https://doi.org/${doi[0]}`;
      }
      nickname = nickname.join('/');
      if (url) {
        return (
          <a
           key={idx}
           href={url}
           className={style['pubmed-link']}
           rel="noopener noreferrer"
           target="_blank">
            {nickname}
          </a>
        );
      }
      else {
        return nickname;
      }
    }
  ),
  data => sortBy(data, row => (
    ((row.articles[0] || {}).nickname || [''])[0]
  ))
);


const virusSpeciesDef = new ColDef(
  'virusName', 'Virus Species'
);


export {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef
};
