import React from 'react';
import PropTypes from 'prop-types';

import initSqlJs from 'sql.js';
import {DRDB_FILE, SQL_WASM} from './config';

import SimpleTable, {
  ColumnDef as ColDef
} from 'sierra-frontend/dist/components/simple-table';


const tableColumns = [
  new ColDef({
    name: 'ab_name',
    label: 'ab_name',
  }),
  new ColDef({
    name: 'pdb_id',
    label: 'pdb_id',
  }),
  new ColDef({
    name: 'abbreviation_name',
    label: 'abbreviation_name',
  }),
  new ColDef({
    name: 'availability',
    label: 'availability',
  }),
  new ColDef({
    name: 'date_added',
    label: 'date_added',
  }),
];


export default class Drdb extends React.Component {

  constructor() {
    super(...arguments);
    this.state = {
      table: []
    };
  }

  async componentDidMount() {
    const dbfile = '';
    const sqlPromise = await initSqlJs({
      locateFile: file => SQL_WASM
    });

    const dataPromise = fetch(DRDB_FILE).then(res => res.arrayBuffer());

    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    const db = new SQL.Database(new Uint8Array(buf));
    this.setState({
      db: db
    });


  }

  insert(e) {
    const stmt = e.target.value;
    this.setState({
      stmt: stmt
    });
  }

  query() {
    const {stmt, db} = this.state;
    const res = db.exec(stmt);
    const columns = res[0].columns;
    const values = res[0].values;
    console.log(values);

    const table = values.map((record) => {
      let result = {}
      columns.forEach((cell, idx) => {
        result[cell] = record[idx];
      })
      return result;
    });
    this.setState({
      table:table
    })
  }

  render() {
    const {table} = this.state;
    return (
      <>
        <input placeholder="sql statements" onChange={this.insert.bind(this)}></input>
        <button onClick={this.query.bind(this)}>Search</button>
        {table.length > 0 ?
          <SimpleTable
            columnDefs={[...tableColumns]}
            data={table} />
       : null}
      </>
    );
  }
}
