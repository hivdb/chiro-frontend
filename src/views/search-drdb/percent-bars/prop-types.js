import PropTypes from 'prop-types';

import * as types from './types';

const itemShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  shortDisplay: PropTypes.node.isRequired,
  fullDisplay: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(types)).isRequired,
  subItems: PropTypes.arrayOf(
    () => itemShape.isRequired
  ),
  numExp: PropTypes.number.isRequired
});


export {itemShape};
