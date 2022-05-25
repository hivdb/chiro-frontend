import React from 'react';
import memoize from 'lodash/memoize';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';

import {csvJoin} from './funcs';


const CACHE_URL_PREFIX = (
  'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/covid-drdb:susc-summary'
);

const EMPTY = {
  article: {},
  'antibody:any': {},
  antibody: {},
  infectedVariant: {},
  vaccine: {},
  isolateAgg: {},
  variant: {},
  isolate: {},
  position: {}
};


const fetchCache = memoize(async cacheKey => {
  const hash = sha256(cacheKey).toString(encHex);
  const url = `${
    CACHE_URL_PREFIX
  }/${
    hash.slice(0, 2)
  }/${
    hash.slice(2, 4)
  }/${
    hash.slice(4, 64)
  }.json`;
  console.log('T1', new Date().getTime());
  try {
    const resp = await fetch(url);
    if (resp.status === 200) {
      return await resp.json();
    }
    else {
      return {
        params: JSON.parse(cacheKey),
        ...EMPTY
      };
    }
  }
  finally {
    console.log('T2', new Date().getTime());
  }
});


function setParams(params, key, val) {
  if (val !== undefined && val !== null && val !== '') {
    params[key] = val;
  }
}


function useCacheKey(props) {
  return React.useMemo(
    () => {
      const params = {};
      setParams(params, 'refName', props.refName);
      setParams(
        params,
        'antibodyNames',
        csvJoin(props.abNames || [])
      );
      setParams(params, 'vaccineName', props.vaccineName);
      setParams(params, 'infectedVarName', props.infectedVarName);
      setParams(params, 'varName', props.varName);
      setParams(params, 'isoAggkey', props.isoAggkey);
      setParams(params, 'position', props.genePos);
      return JSON.stringify(params);
    },
    [
      props.abNames,
      props.genePos,
      props.infectedVarName,
      props.isoAggkey,
      props.refName,
      props.vaccineName,
      props.varName
    ]
  );
}


export default function useSuscSummary(props) {
  const [payload, setPayload] = React.useState(null);
  const cacheKey = useCacheKey(props);
  const isPending = payload === null;

  React.useEffect(
    () => {
      let mounted = true;
      if (isPending) {
        fetchCache(cacheKey)
          .then(data => mounted && setPayload(data));
      }
      return () => mounted = false;
    },
    [cacheKey, setPayload, isPending]
  );

  const defaultPayload = React.useMemo(
    () => payload || {},
    [payload]
  );


  return [defaultPayload, isPending];
}
