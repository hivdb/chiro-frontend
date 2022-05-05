import React from 'react';
import memoize from 'lodash/memoize';
import camelCase from 'lodash/camelCase';

// check this solution later: https://stackoverflow.com/a/61722010/2644759
// eslint-disable-next-line import/no-webpack-loader-syntax
// import sqliteWASM from '!!file-loader!sql.js/dist/sql-wasm.wasm';

import {loadBinary} from '../../../utils/covid-drdb';

import useConfig from './use-config';

const MAX_WORKERS = (() => {
  let workers = (window.navigator.hardwareConcurrency || 5) - 4;
  if (workers < 1) {
    workers = 1;
  }
  const ram = window.navigator.deviceMemory;
  if (ram) {
    workers = Math.min(workers, Math.ceil(ram / 0.5));
  }
  return workers;
})();

// eslint-disable-next-line no-console
console.debug(`SQLite pool: ${MAX_WORKERS} threads allowed`);
const WORKER_POOL = {};

async function createClient(drdbVersion) {
  let worker, onRelease, curIdx;
  WORKER_POOL[drdbVersion] = WORKER_POOL[drdbVersion] || {
    pool: new Array(MAX_WORKERS).fill(null),
    totalWorkers: 0,
    locks: new Array(MAX_WORKERS).fill(null)
  };
  const {pool, totalWorkers, locks} = WORKER_POOL[drdbVersion];
  do {
    curIdx = locks.findIndex(lock => lock === null);
    if (curIdx > -1 && pool[curIdx] !== null) {
      worker = pool[curIdx];
      pool[curIdx] = null;
      updateLocks(curIdx);
      // eslint-disable-next-line no-console
      console.debug(
        'SQLite pool: Retrieve worker from pool' +
        ` (${curIdx + 1}/${MAX_WORKERS})`
      );
    }
    else if (totalWorkers < MAX_WORKERS) {
      const newWorker = new Worker('/worker.sql-wasm.js');
      curIdx = totalWorkers;
      updateLocks(curIdx);
      // eslint-disable-next-line no-console
      console.debug(
        'SQLite pool: New SQLite worker created' +
        ` (${curIdx + 1}/${MAX_WORKERS}, a)`
      );

      WORKER_POOL[drdbVersion].totalWorkers ++;

      const {payload} = await loadBinary(
        `covid-drdb-${drdbVersion}.db`
      );

      const promise = new Promise(
        resolve => {
          newWorker.addEventListener('message', handleMessage);

          function handleMessage({data}) {
            if (data.id === 1 && data.ready) {
              newWorker.removeEventListener('message', handleMessage);
              resolve(newWorker);
            }
          }
        }
      );

      newWorker.postMessage({
        id: 1,
        action: 'open',
        buffer: new Uint8Array(payload)
      });
      worker = await promise;
    }
    else {
      // eslint-disable-next-line no-console
      console.debug('SQLite pool: Await for free SQLite worker...');
      curIdx = await Promise.any(locks);
      if (pool[curIdx] === null) {
        // eslint-disable-next-line no-console
        console.debug(
          'SQLite pool: worker is already locked by another coroutine, ' +
          'trying again...'
        );
        continue;
      }
      worker = pool[curIdx];
      pool[curIdx] = null;
      updateLocks(curIdx);
      // eslint-disable-next-line no-console
      console.debug(
        'SQLite pool: Retrieve worker from pool' +
        ` (${curIdx + 1}/${MAX_WORKERS}, b)`
      );
    }
    break;
  } while (!worker);

  return [await worker, () => {
    pool[curIdx] = worker;
    onRelease(curIdx);
    // eslint-disable-next-line no-console
    console.debug(
      'SQLite pool: Put worker back' +
      ` (${curIdx + 1}/${MAX_WORKERS})`
    );
  }];

  function updateLocks(idx) {
    locks[idx] = new Promise(
      resolve => {
        onRelease = resolve;
      }
    );
  }

}


const execSQL = memoize(
  async function execSQL({sql, params, drdbVersion}) {
    const start = new Date().getTime();
    const [worker, releaseWorker] = await createClient(drdbVersion);

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
            releaseWorker();
            const end = new Date().getTime();
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.debug(
                `${results && results.length > 0 ?
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
