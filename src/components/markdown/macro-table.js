import React from 'react';
import toPath from 'lodash/toPath';
import nl2br from 'react-nl2br';
import sortBy from 'lodash/sortBy';

import macroPlugin from './macro-plugin';
import ChiroTable, {ColumnDef} from '../chiro-table';

import style from './style.module.scss';

macroPlugin.addMacro('table', (content) => {
  return {
    type: 'TableNode',
    tableName: content.trim()
  };
});


const renderFuncs = {

  join: (value, row, context, {joinBy = ''}) => {
    if (!value) {
      return null;
    }
    return nl2br(value.join(joinBy));
  },

  articleList: articles => {
    return <>
      {articles.map(({
        doi, firstAuthor: {surname}, year, journal, journalShort
      }, idx) => <div key={idx} className={style.nowrap}>
        <a
         href={`https://doi.org/${doi}`}
         rel="noopener noreferrer"
         target="_blank">
          {surname} {year}
        </a>
        {' '}({journalShort ? journalShort : journal})
      </div>)}
    </>;
  },

  nl2br: value => nl2br(value),

  nowrap: value => <span className={style.nowrap}>{value}</span>

};

const sortFuncs = {

  articleList: rows => sortBy(
    rows, ({references}) => references.map(
      ({firstAuthor: {surname}, year}) => [surname, -year]
    )
  )

};


function buildColumnDefs(columnDefs) {
  const objs = [];
  for (const colDef of columnDefs) {
    let {render, sort} = colDef;
    if (typeof render === 'string') {
      render = renderFuncs[render];
    }
    if (typeof sort === 'string') {
      sort = sortFuncs[sort];
    }
    objs.push(new ColumnDef({
      ...colDef, render, sort
    }));
  }
  return objs;
}


function expandMultiCells(data, columnDefs) {
  let expandTarget = null;
  for (const {name, multiCells} of columnDefs) {
    if (!multiCells) {
      continue;
    }
    const [attr] = toPath(name);
    if (expandTarget && expandTarget !== attr) {
      throw new Error(
        'Can only expand one attribute of a row group, ' +
        `but two were specified: ${expandTarget} and ${attr}`
      );
    }
    expandTarget = attr;
  }
  const newRows = [];
  for (let i = 0; i < data.length; i ++) {
    const row = data[i];
    const subRows = row[expandTarget];
    delete row[expandTarget];
    for (const subRow of subRows) {
      const newRow = {...row, _spanIndex: i};
      newRow[expandTarget] = subRow;
      newRows.push(newRow);
    }
  }
  return newRows;
}


function Table({cacheKey, columnDefs, data}) {
  columnDefs = buildColumnDefs(columnDefs);
  data = expandMultiCells(data, columnDefs);

  return (
    <ChiroTable
     cacheKey={cacheKey}
     columnDefs={columnDefs}
     data={data} />
  );
}


export default function TableNode({tables}) {
  return ({tableName}) => {
    if (tableName in tables) {
      return <Table cacheKey={tableName} {...tables[tableName]} />;
    }
    else {
      return <div>
        <strong>Error</strong>: table data of {tableName} is not found.
      </div>;
    }
  };
}
