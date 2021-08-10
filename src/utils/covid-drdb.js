import memoize from 'lodash/memoize';

const BASE_URI = 's3-us-west-2.amazonaws.com/cms.hivdb.org/covid-drdb';


const _loadBinary = memoize(async function _loadBinary(resPath) {
  const resp = await fetch(
    `https://${BASE_URI}/${resPath}`,
    {cache: 'default'}
  );
  if (resp.status === 403 || resp.status === 404) {
    throw new Error(`Resource not found: ${resPath}`);
  }

  const payload = await resp.arrayBuffer();
  return {
    payload,
    resPath
  };
});


export async function loadBinary(resPath) {
  return await _loadBinary(resPath);
}
