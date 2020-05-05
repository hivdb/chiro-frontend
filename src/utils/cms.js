function cmsStageHost(host) {
  if (host === 'covdb.stanford.edu') {
    return 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-prod';
  }
  else {
    return 's3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev';
  }
}


export async function loadPage(pageName) {
  let stage;
  let payload;
  const {hostname} = window.location;
  stage = cmsStageHost(hostname);
  const resp = await fetch(
    `https://${stage}/pages/${pageName}.json`
  );
  if (resp.status === 403 || resp.status === 404) {
    throw new Error(`Page not found: ${pageName}`);
  }
  payload = await resp.json();
  return {
    ...payload,
    imagePrefix: `https://${stage}/images/`,
    cmsPrefix: `https://${stage}/`
  };
}


export function getFullLink(path) {
  let stage;
  const {hostname} = window.location;
  stage = cmsStageHost(hostname);

  return `https://${stage}/${path}`;
}
