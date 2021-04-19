import React from 'react';

import initSqlJs from 'sql.js';

// check this solution later: https://stackoverflow.com/a/61722010/2644759
// eslint-disable-next-line import/no-webpack-loader-syntax
// import sqliteWASM from '!!file-loader!sql.js/dist/sql-wasm.wasm';

import {loadBinary} from '../cms';

const sqliteWASM = 'https://sql.js.org/dist/sql-wasm.wasm';


async function initClient(drdbVersion, setClient, mounted) {
  const SQL = await initSqlJs({
    locateFile: file => sqliteWASM
  });

  const {payload} = await loadBinary(
    `downloads/covid-drdb/${drdbVersion}.db`
  );

  if (mounted.mounted) {
    setClient(new SQL.Database(new Uint8Array(payload)));
  }
}


export default function useQuery(statement, config) {

  const {drdbVersion} = config || {};
  const [client, setClient] = React.useState(null);

  React.useEffect(
    () => {
      if (!drdbVersion) {
        return;
      }
      const mounted = {mounted: true};
      initClient(drdbVersion, setClient, mounted);
      return () => {
        mounted.mounted = false;
      };
    },
    [setClient, drdbVersion]
  );

  return React.useMemo(
    () => {
      if (client) {
        const [res] = client.exec(statement);
        const {
          columns,
          values
        } = res;

        return {
          payload: values.map(record => (
            columns.reduce((acc, col, idx) => {
              acc[col] = record[idx];
              return acc;
            }, {})
          )),
          isPending: false
        };
      }
      else {
        return {
          isPending: true
        };
      }
    },
    [client, statement]
  );

}
