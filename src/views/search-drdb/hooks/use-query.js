import React from 'react';
import memoize from 'lodash/memoize';
import camelCase from 'lodash/camelCase';

// check this solution later: https://stackoverflow.com/a/61722010/2644759
// eslint-disable-next-line import/no-webpack-loader-syntax
// import sqliteWASM from '!!file-loader!sql.js/dist/sql-wasm.wasm';

import {loadBinary} from '../../../utils/cms';

import useConfig from './use-config';


const createClient = memoize(
  async function initClient(drdbVersion) {
    const worker = new Worker('/worker.sql-wasm.js');
  
    const {payload} = await loadBinary(
      `downloads/covid-drdb/${drdbVersion}.db`
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
  async function execSQL({sql, params, drdbVersion}, setRes) {
    setRes(null);
    const worker = await createClient(drdbVersion);

    const myId = parseInt(
      Math.random() * (Number.MAX_SAFE_INTEGER - 1)
    ) + 1;

    const promise = new Promise(
      resolve => {
        worker.addEventListener('message', handleMessage);

        function handleMessage({data: {id, results}}) {
          if (id === myId) {
            worker.removeEventListener('message', handleMessage);
            setRes(results);
            resolve(results);
          }
        }
      }
    );

    worker.postMessage({
      id: myId,
      action: 'exec',
      sql,
      params: params
    });

    return await promise;
  },
  args => JSON.stringify(args)
);


export default function useQuery({sql, params, skip = false, camel = true}) {
  const {config, isPending} = useConfig();
  const {drdbVersion} = config || {};
  const [res, setRes] = React.useState(null);

  React.useEffect(
    () => {
      if (skip || isPending || !drdbVersion) {
        return;
      }
      if (sql && drdbVersion) {
        execSQL({sql, params, drdbVersion}, setRes).then(res => {
          setRes(res);
        });
      }
    },
    [
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
      if (res) {
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
    [res, skip, camel]
  );

}
