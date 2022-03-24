import React from 'react';
import PropTypes from 'prop-types';


export default function FragmentWithoutWarning({children}) {
  return <React.Fragment>{children}</React.Fragment>;
}

FragmentWithoutWarning.propTypes = {
  children: PropTypes.node
};
