import React from 'react';
import sortBy from 'lodash/sortBy';
import startCase from 'lodash/startCase';

import style from './style.module.scss';


class ColDef {

  constructor(name, label, render, sort) {
    this.name = name;
    this.label = label ? label : startCase(name);
    this.render = render ? render : cellData => (
      (cellData === null || cellData === '') ? 'NA' : cellData
    );
    this.sort = sort ? sort : data => sortBy(data, [name]);
  }

}


function reformExpData(expData) {
  if (!expData || !expData.edges) {
    return [];
  }
  return expData.edges.map(({node}) => node);
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
    ({nickname}) => nickname.join('/')
  ).join('; ')
);


const virusSpeciesDef = new ColDef(
  'virusName', 'Virus Species',
  (virus, {strainName}) => strainName ? <>
    {virus}
    <div className={style['supplement-info']}>
      {strainName}
    </div>
  </> : virus,
);


export {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef
};
