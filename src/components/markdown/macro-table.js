import React from 'react';
import toPath from 'lodash/toPath';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import OrigMarkdown from 'react-markdown/with-html';

import macroPlugin from './macro-plugin';
import ChiroTable, {ColumnDef} from '../chiro-table';

import style from './style.module.scss';

macroPlugin.addMacro('table', (content) => {
  return {
    type: 'TableNode',
    tableName: content.trim()
  };
});


function nl2brMdText(text) {
  if (typeof text === 'string') {
    return text.replace(/([^\n]|^)\n(?!\n)/g, '$1  \n');
  }
  else {
    return text;
  }
}


function defaultRenderer(mdProps) {
  return value => {
    if (typeof value === 'string') {
      return <OrigMarkdown {...mdProps} source={value} />;
    }
    else {
      return value;
    }
  };
}


const renderFuncs = {

  default: defaultRenderer,
  nl2br(mdProps) {
    return value => defaultRenderer(mdProps)(nl2brMdText(value));
  },

  join(mdProps) {
    return (value, row, context, {joinBy = ''}) => {
      if (!value) {
        return null;
      }
      return defaultRenderer(mdProps)(value.join(joinBy));
    };
  },

  articleList(mdProps) {
    return articles => <>
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

  nowrap(mdProps) {
    return value => <span className={style.nowrap}>
      {defaultRenderer(mdProps)(value)}
    </span>;
  }

};

const sortFuncs = {

  articleList: rows => sortBy(
    rows, ({references}) => references.map(
      ({firstAuthor: {surname}, year}) => [surname, -year]
    )
  ),

  numeric: (rows, column) => sortBy(
    rows, row => parseInt(nestedGet(row, column))
  )

};


function buildColumnDefs(columnDefs, mdProps) {
  const objs = [];
  const colHeaderRenderer = renderFuncs.nl2br(mdProps);
  for (const colDef of columnDefs) {
    let {render, sort} = colDef;
    if (typeof render === 'string') {
      render = renderFuncs[render](mdProps);
    }
    else {
      render = renderFuncs.default(mdProps);
    }
    if (typeof sort === 'string') {
      sort = sortFuncs[sort];
    }
    if (colDef.label) {
      colDef.label = colHeaderRenderer(colDef.label);
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
  if (expandTarget === null) {
    return data;
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


function Table({
  cacheKey,
  columnDefs,
  data,
  references,
  mdProps: {renderers, ...mdProps},
  tableScrollStyle = {},
  tableStyle = {}}
) {
  renderers = {
    ...renderers,
    paragraph: ({children}) => <>{children}</>
  };
  columnDefs = buildColumnDefs(columnDefs, {...mdProps, renderers});
  data = expandMultiCells(data, columnDefs);

  return <>
    <ChiroTable
     cacheKey={cacheKey}
     tableScrollStyle={tableScrollStyle}
     tableStyle={tableStyle}
     columnDefs={columnDefs}
     data={data} />
    <OrigMarkdown
     {...mdProps}
     renderers={renderers}
     source={references} />
  </>;
}


export default function TableNode({tables, mdProps}) {
  return ({tableName}) => {
    if (tableName in tables) {
      return (
        <Table
         cacheKey={tableName}
         mdProps={mdProps}
         {...tables[tableName]} />
      );
    }
    else {
      return <div>
        <strong>Error</strong>: table data of {tableName} is not found.
      </div>;
    }
  };
}
