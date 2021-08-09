import PropTypes from 'prop-types';

import * as types from './types';

const itemShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  display: PropTypes.node.isRequired,
  displayExtra: PropTypes.node,
  displayAfterExtra: PropTypes.node,
  type: PropTypes.oneOf(Object.values(types)).isRequired,
  subItems: PropTypes.arrayOf(
    () => itemShape.isRequired
  ),
  numExp: PropTypes.number.isRequired
});


export {itemShape};
