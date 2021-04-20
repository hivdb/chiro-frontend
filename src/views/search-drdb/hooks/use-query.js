import React from 'react';
import memoize from 'lodash/memoize';
import camelCase from 'lodash/camelCase';

import initSqlJs from 'sql.js';

// check this solution later: https://stackoverflow.com/a/61722010/2644759
// eslint-disable-next-line import/no-webpack-loader-syntax
// import sqliteWASM from '!!file-loader!sql.js/dist/sql-wasm.wasm';

import {loadBinary} from '../../../utils/cms';

import useConfig from './use-config';

const sqliteWASM = '/sql-wasm.wasm';


const createClient = memoize(
  async function initClient(drdbVersion) {
    const SQL = await initSqlJs({
      locateFile: file => sqliteWASM
    });
  
    const {payload} = await loadBinary(
      `downloads/covid-drdb/${drdbVersion}.db`
    );

    return new SQL.Database(new Uint8Array(payload));
  }
);


async function initClient(drdbVersion, setClient, mounted) {
  if (mounted.mounted) {
    const client = await createClient(drdbVersion);
    setClient(client);
  }
}


export default function useQuery({sql, params, skip = false, camel = true}) {
  const {config, isPending} = useConfig();
  const {drdbVersion} = config || {};
  const [client, setClient] = React.useState(null);

  React.useEffect(
    () => {
      if (skip || isPending || !drdbVersion) {
        return;
      }
      const mounted = {mounted: true};
      initClient(drdbVersion, setClient, mounted);
      return () => {
        mounted.mounted = false;
      };
    },
    [setClient, drdbVersion, skip, isPending]
  );

  return React.useMemo(
    () => {
      if (skip) {
        return {
          isPending: false
        };
      }
      if (client) {
        const res = client.exec(sql, params);
        if (res.length === 0) {
          return {
            payload: [],
            isPending: false
          };
        }
        let [{
          columns,
          values
        }] = res;
        if (camel) {
          columns = columns.map(col => camelCase(col));
        }

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
    [client, sql, params, skip, camel]
  );

}
