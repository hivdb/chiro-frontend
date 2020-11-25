import memoize from 'lodash/memoize';

function cmsStageHost(host) {
  if (host === 'covdb.stanford.edu') {
    return 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-prod';
  }
  else {
    return 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev';
  }
}


const _loadPage = memoize(async function _loadPage(pageName) {
  let stage;
  let payload;
  const {hostname} = window.location;
  stage = cmsStageHost(hostname);
  const resp = await fetch(
    `https://${stage}/pages/${pageName}.json`,
    {cache: 'default'}
  );
  if (resp.status === 403 || resp.status === 404) {
    throw new Error(`Page not found: ${pageName}`);
  }
  payload = await resp.json();
  return {
    ...payload,
    pageName,
    imagePrefix: `https://${stage}/images/`,
    cmsPrefix: `https://${stage}/`
  };
});


export async function loadPage(pageName, props = {}) {
  /**
   * Remove the side-effect of "same `Promise` object
   * reference" caused by memoizing `_loadPage`
   *
   * Note:
   *   `loadPage` can be safely used in `render()`
   *   with `PromiseComponent`.
   *
   */
  return {
    ...(await _loadPage(pageName)),
    ...props
  };
}


export function getFullLink(path) {
  let stage;
  const {hostname} = window.location;
  stage = cmsStageHost(hostname);

  return `https://${stage}/${path}`;
}
