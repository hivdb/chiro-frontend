import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import orderBy from 'lodash/orderBy';
import startCase from 'lodash/startCase';

import style from './style.module.scss';


class ColDef {

  constructor({
    name, label, render, sort,
    sortable = true, textAlign = 'center'
  }) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === undefined ||
        cellData === null ||
        cellData === '') ? '?' : cellData
    );
    this.sort = sort ? sort : data => sortBy(data, [name]);
    this.sortable = Boolean(sortable);
    this.textAlign = textAlign;
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
  if (isNaN(num)) {
    return '?';
  }
  let prec = Math.max(Math.floor(Math.log10(num)) + 1, 0);
  if (prec < 2) {
    prec ++;
  }
  return (
    num.toPrecision(prec)
      .replace(/(\.\d*)0+$/, '$1')
      .replace(/\.$/, '')
  );
}


function renderXX50(num, cmp, unit, inactive) {
  if (inactive) {
    return '>>>';
  }
  if (num === null) {
    return '?';
  }
  num = readableNum(num);
  return <span className={style['nowrap']}>
    {cmp === '=' ? '' : cmp}{num}
    {unit === '\xb5M' ? '' : ` ${unit}`}
  </span>;
}


const authorYearColDef = new ColDef({
  name: 'articles',
  label: 'Author/Year',
  render: articles => articles.map(
    ({nickname}, idx) => {
      return <Link key={idx} to={{
        pathname: '/search-result/',
        query: {article: nickname[0]}
      }}>{nickname[0]}</Link>;
    }
  ),
  sort: data => sortBy(data, row => (
    ((row.articles[0] || {}).nickname || [''])[0]
  ))
});


const virusSpeciesDef = new ColDef({
  name: 'virusName',
  label: 'Virus'
});


const compoundColDef = label => new ColDef({
  name: 'compoundNames',
  label,
  render: compoundNames => compoundNames.join(' + '),
  sort: data => sortBy(data, ['compoundNames[0]'])
});


export {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef
};
