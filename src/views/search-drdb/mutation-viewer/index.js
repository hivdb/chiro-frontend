import React, {useState} from 'react';
import PropTypes from 'prop-types';

import GenomeMap from 'sierra-frontend/dist/components/genome-map';
import PresetSelection from './preset-selection';

import shortenMutList from '../shorten-mutlist';
import style from './style.module.scss';


function convertAAPosToAbsNAPos(aaPos, naPosStart, readingFrame) {
  let absNAPos = naPosStart - 3 + aaPos * 3;
  if (readingFrame && readingFrame.length > 0) {
    for (const [breakpoint, offset] of readingFrame) {
      if (absNAPos > breakpoint) {
        absNAPos += offset;
      }
    }
  }
  return absNAPos;
}


function getGenomeMapPositions(mutations, geneDefs, highlightGenes) {
  geneDefs = geneDefs.reduce((acc, geneDef) => {
    acc[geneDef.gene] = geneDef;
    return acc;
  }, {});
  const resultPositions = [];
  const shortMutations = shortenMutList(
    mutations,
    /* asObject = */true,
    /* spikeOnly = */false
  );

  for (const {
    gene,
    position,
    text
  } of shortMutations) {
    const {
      displayGene, range,
      readingFrame
    } = geneDefs[gene];
    const highlight = highlightGenes.includes(gene);
    const absNAPos = convertAAPosToAbsNAPos(position, range[0], readingFrame);
    resultPositions.push({
      gene: displayGene,
      name: highlight ? text : `${displayGene}:${text}`,
      pos: absNAPos,
      ...(highlight ? null : {
        stroke: '#e0e0e0',
        color: '#a0a0a0'
      })
    });
  }
  return resultPositions;
}


MutationViewer.propTypes = {
  regionPresets: PropTypes.object.isRequired,
  mutations: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
      refAminoAcid: PropTypes.string.isRequired,
      aminoAcid: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
};


function MutationViewer({
  regionPresets,
  mutations
}) {
  const {presets, genes} = regionPresets;
  const [preset, setPreset] = useState(presets[0]);
  const {
    name: curName,
    highlightGenes,
    preset: {minHeight, regions, ...otherPreset}
  } = preset;
  const presetOptions = presets.map(({name, label}) => ({
    value: name, label
  }));
  const payload = {
    name: curName,
    label: '',
    ...otherPreset,
    regions: [...regions],
    height: minHeight,
    positionGroups: [{
      name: 'NA',
      label: '',
      positions: getGenomeMapPositions(mutations, genes, highlightGenes)
    }]
  };
  return (
    <GenomeMap
     key={curName}
     preset={payload}
     className={style['sierra-genome-map']}
     extraButtons={
       <PresetSelection
        value={curName}
        options={presetOptions}
        onChange={handleChange} />
     } />
  );

  function handleChange(value) {
    const preset = presets.find(({name}) => name === value);
    setPreset(preset);
  }
}


export default React.memo(MutationViewer);
