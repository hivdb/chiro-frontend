import React from 'react';
import memoize from 'lodash/memoize';
import camelCase from 'lodash/camelCase';

// check this solution later: https://stackoverflow.com/a/61722010/2644759
// eslint-disable-next-line import/no-webpack-loader-syntax
// import sqliteWASM from '!!file-loader!sql.js/dist/sql-wasm.wasm';

import {loadBinary} from '../../../utils/covid-drdb';

import useConfig from './use-config';


const createClient = memoize(
  async function initClient(drdbVersion) {
    const worker = new Worker('/worker.sql-wasm.js');

    const {payload} = await loadBinary(
      `covid-drdb-${drdbVersion}.db`
    );

    const promise = new Promise(
      resolve => {
        worker.addEventListener('message', handleMessage);

        function handleMessage({data}) {
          if (data.id === 1 && data.ready) {
            worker.removeEventListener('message', handleMessage);
            resolve(worker);
          }
        }
      }
    );

    worker.postMessage({
      id: 1,
      action: 'open',
      buffer: new Uint8Array(payload)
    });

    return await promise;
  }
);


const execSQL = memoize(
  async function execSQL({sql, params, drdbVersion}) {
    const start = new Date().getTime();
    const worker = await createClient(drdbVersion);

    const myId = parseInt(
      Math.random() * (Number.MAX_SAFE_INTEGER - 1)
    ) + 1;

    const promise = new Promise(
      resolve => {
        worker.addEventListener('message', handleMessage);

        function handleMessage({data: {id, results, error}}) {
          if (id === myId) {
            if (error) {
              console.error(sql, params, error);
            }
            worker.removeEventListener('message', handleMessage);
            const end = new Date().getTime();
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.debug(
                `${results.length > 0 ?
                  `${results[0].values.length} returned` :
                  'SQL was executed'} in ${end - start}ms:`,
                sql,
                params,
                results
              );
            }
            resolve(results);
          }
        }
      }
    );

    worker.postMessage({
      id: myId,
      action: 'exec',
      sql,
      params
    });

    return await promise;
  },
  args => JSON.stringify(args)
);


export default function useQuery({sql, params, skip = false, camel = true}) {
  if (!skip && !sql) {
    throw new Error('Required parameter "sql" is empty');
  }
  const {config, isPending} = useConfig();
  const {drdbVersion} = config || {};
  const [res, setRes] = React.useState(null);

  let {current} = React.useRef({dirty: true});

  React.useMemo(
    () => {
      if (skip || isPending || !drdbVersion) {
        return;
      }
      const payload = JSON.stringify({sql, params});
      if (current.payload !== payload) {
        current.payload = payload;
        current.dirty = true;
      }
    },
    [
      current,
      sql,
      params,
      skip,
      isPending,
      drdbVersion
    ]
  );

  React.useEffect(
    () => {
      if (skip || isPending || !drdbVersion) {
        return;
      }
      if (sql && drdbVersion) {
        execSQL({sql, params, drdbVersion}).then(res => {
          current.dirty = false;
          setRes(res);
        });
      }
    },
    [
      current,
      setRes,
      sql,
      params,
      skip,
      isPending,
      drdbVersion
    ]
  );

  return React.useMemo(
    () => {
      if (skip) {
        return {
          isPending: false
        };
      }
      if (!current.dirty && res) {
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
    [current.dirty, res, skip, camel]
  );

}
