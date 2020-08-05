let backendPrefix = '';

if (window.__NODE_ENV === 'production') {
  backendPrefix = '';
} else {
  backendPrefix = 'http://127.0.0.1:5000';
}


const repoSierraSARS2 = (
  'https://raw.githubusercontent.com/hivdb/sierra-sars2/master'
);


function makeGeneRefSeqLoader(gene) {
  return async() => {
    const resp = await fetch(
      `${repoSierraSARS2}/src/main/resources/genes.json`
    );
    const data = await resp.json();
    for (const {name, refSequence} of data) {
      if (name === gene) {
        return refSequence;
      }
    }
    return null;
  };
}


function makeMutationAnnotationLoader(gene) {
  return async() => {
    const resp = await fetch(
      `${repoSierraSARS2}/src/main/resources/mutation-annotations_${gene}.json`
    );
    return await resp.json();
  };
}


const mutAnnotEditorConfig = {
  presets: [
    {
      name: 'SARS2S',
      display: "SARS-CoV-2 Spike gene",
      refSeqLoader: makeGeneRefSeqLoader('SARS2S'),
      annotationLoader: makeMutationAnnotationLoader('SARS2S')
    }
  ]
};

export {
  backendPrefix,
  mutAnnotEditorConfig
};
