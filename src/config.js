import {loadPage} from './utils/cms';

let backendPrefix = '';

if (window.__NODE_ENV === 'production') {
  backendPrefix = '';
} else {
  backendPrefix = 'http://127.0.0.1:5000';
}


function makeMutationAnnotationLoader(pageName) {
  return async () => {
    const payload = await loadPage(pageName);
    return payload.data;
  };
}


const mutAnnotViewerConfig = {
  presets: [
    {
      name: 'SARS2S',
      display: "SARS-CoV-2 Spike gene",
      asyncPageName: 'mutannot-spike',
      annotationLoader: makeMutationAnnotationLoader('mutannot-spike')
    },
    {
      name: 'SARS2RdRP',
      display: "SARS-CoV-2 RdRP gene",
      asyncPageName: 'mutannot-rdrp',
      annotationLoader: makeMutationAnnotationLoader('mutannot-rdrp')
    }
  ]
};

export {
  backendPrefix,
  mutAnnotViewerConfig
};
