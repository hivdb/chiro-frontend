import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';


export default function CellReference({refName, displayName}) {
  return (
    <Link to={{
      pathname: '/search-drdb/',
      query: {
        'article': refName
      }
    }}>
      {displayName}
    </Link>
  );
}


CellReference.propTypes = {
  refName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired
};
