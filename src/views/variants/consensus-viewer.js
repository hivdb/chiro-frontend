import React from 'react';
import PropTypes from 'prop-types';
import InlineLoader from 'icosa/components/inline-loader';

import MutationViewer from '../../components/mutation-viewer';
import useVariantConsensus from './use-variant-consensus';


ConsensusViewer.propTypes = {
  varName: PropTypes.string.isRequired,
  parentVarName: PropTypes.string,
  regionPresets: PropTypes.object.isRequired,
  drdbVersion: PropTypes.string.isRequired
};


export default function ConsensusViewer({
  varName,
  parentVarName,
  regionPresets,
  drdbVersion
}) {

  const [consensus, isPending] = useVariantConsensus({
    varName,
    parentVarName,
    drdbVersion
  });

  return isPending ?
    <InlineLoader /> : (
      <MutationViewer
       title={varName}
       mutations={consensus}
       regionPresets={regionPresets} />
    );
}
