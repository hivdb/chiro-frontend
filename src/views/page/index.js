import React from 'react';
import PropTypes from 'prop-types';

import CMSPage from './cms';


Page.propTypes = {
  match: PropTypes.shape({
    location: PropTypes.object.isRequired,
    params: PropTypes.shape({
      pageName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default function Page({
  match: {
    params: {pageName}
  }
}) {
  return <CMSPage key={pageName} pageName={pageName} />;
}
