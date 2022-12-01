import {loadPage} from './utils/cms';
import refDataLoader from './components/refdata-loader';

let backendPrefix = '';

if (window.__NODE_ENV === 'production') {
  backendPrefix = '';
} else {
  backendPrefix = 'http://127.0.0.1:5000';
}


function makeMutationAnnotationLoader(pageName) {
  return async () => {
    const {data, comments = []} = await loadPage(pageName);
    return {...data, comments};
  };
}


const mutAnnotViewerConfig = {
  presets: [
    {
      name: 'spike',
      display: "Spike",
      asyncPageName: 'mutannot-spike',
      annotationLoader: makeMutationAnnotationLoader('mutannot-spike')
    },
    {
      name: 'rdrp',
      display: "RNA-dependent RNA polymerase (RdRP)",
      asyncPageName: 'mutannot-rdrp',
      annotationLoader: makeMutationAnnotationLoader('mutannot-rdrp')
    },
    {
      name: '3clpro',
      display: "3C-like protease (3CL/Mpro)",
      asyncPageName: 'mutannot-3clpro',
      annotationLoader: makeMutationAnnotationLoader('mutannot-3clpro')
    }
  ],
  refDataLoader
};


export {
  backendPrefix,
  mutAnnotViewerConfig
};
