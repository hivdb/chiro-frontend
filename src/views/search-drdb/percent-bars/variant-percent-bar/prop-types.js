import PropTypes from 'prop-types';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_ISO,
  TYPE_OTHER
} from './types';


const itemShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  display: PropTypes.node.isRequired,
  displayExtra: PropTypes.node,
  type: PropTypes.oneOf([
    TYPE_VARIANT,
    TYPE_ISOAGG,
    TYPE_ISO,
    TYPE_OTHER
  ]).isRequired,
  subItems: PropTypes.arrayOf(
    () => itemShape.isRequired
  ),
  numExp: PropTypes.number.isRequired
});


export {itemShape};
