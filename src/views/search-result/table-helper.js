import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import orderBy from 'lodash/orderBy';
import startCase from 'lodash/startCase';

import style from './style.module.scss';


class ColDef {

  constructor(name, label, render, sort, sortable = true) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === undefined ||
        cellData === null ||
        cellData === '') ? 'NA' : cellData
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


function renderXX50(num, cmp, unit, inactive) {
  if (inactive) {
    return <em>inactive</em>;
  }
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
    ({nickname}, idx) => {
      return <Link key={idx} to={{
        pathname: '/search-result/',
        query: {article: nickname[0]}
      }}>{nickname[0]}</Link>;
    }
  ),
  data => sortBy(data, row => (
    ((row.articles[0] || {}).nickname || [''])[0]
  ))
);


const virusSpeciesDef = new ColDef(
  'virusName', 'Virus Species'
);


const compoundColDef = label => new ColDef(
  'compoundNames', label,
  compoundNames => compoundNames.join(' + '),
  data => sortBy(data, ['compoundNames[0]'])
);


export {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef
};
