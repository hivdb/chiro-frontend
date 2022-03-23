/*import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';


Desc.propTypes = {
  n: PropTypes.number.isRequired,
  approx: PropTypes.bool.isRequired
};

Desc.defaultProps = {
  approx: false
};*/

export default function Desc(/*{n, approx}*/) {
  /*let prefix = null;
  if (approx) {
    prefix = '~';
    if (n > 1000) {
      n = parseFloat(n.toPrecision(2));
    }
    else if (n > 100) {
      n = parseFloat(n.toPrecision(1));
    }
    else if (n > 50) {
      n = 80;
    }
    else if (n > 20) {
      n = 40;
    }
    else if (n > 10) {
      n = 15;
    }
    else if (n > 1) {
      n = 5;
    }
    else {
      prefix = null;
    }
  }

  return <span className="description">
    {prefix}{pluralize('mutation', n, true)}
  </span>;*/
  return null;
}
