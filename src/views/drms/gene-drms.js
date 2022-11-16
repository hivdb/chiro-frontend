import React from 'react';
import PropTypes from 'prop-types';

import PageLoader from '../../components/page-loader';

import SpikeDRMs from './spike-drms';
import MproDRMs from './3clpro-drms';
import RdRPDRMs from './rdrp-drms';


GeneDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  sectionName: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      gene: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
};


function GeneDRMs({drdbVersion, sectionName, sections}) {
  const secProps = React.useMemo(
    () => sections.find(s => s.name === sectionName),
    [sections, sectionName]
  );

  if (sectionName === 'spike') {
    return <SpikeDRMs drdbVersion={drdbVersion} {...secProps} />;
  }
  else if (sectionName === '3clpro') {
    return <MproDRMs drdbVersion={drdbVersion} {...secProps} />;
  }
  else if (sectionName === 'rdrp') {
    return <RdRPDRMs drdbVersion={drdbVersion} {...secProps} />;
  }
  else {
    return null;
  }
}


GeneDRMsContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default function GeneDRMsContainer({match: {params: {name}}}) {
  return (
    <PageLoader
     pageName="sars2-drms"
     sectionName={name}
     component={GeneDRMs} />
  );
}
