import {loadPage} from './utils/cms';
import LoadReferences from './components/load-references';

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
  ],
  LoadReferences
};


const genomeViewerConfig = {
  presets: [
    {
      name: 'sars2-linages',
      label: "SARS-CoV-2 Lineages",
      payloadLoader: async () => (
        await loadPage('genome-viewer/sars2-lineages')
      )
    },
    {
      name: 'sars2-case-reports',
      label: "SARS-CoV-2 Prolonged Case Reports",
      payloadLoader: async () => (
        await loadPage('genome-viewer/sars2-case-reports')
      )
    }
  ]
};


export {
  backendPrefix,
  mutAnnotViewerConfig,
  genomeViewerConfig
};
