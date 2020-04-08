import PropTypes from 'prop-types';

const compoundShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  synonyms: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  drugClassName: PropTypes.string,
  category: PropTypes.string,
  target: PropTypes.string,
  molecularWeight: PropTypes.number,
  isPrimaryCompound: PropTypes.boolean,
  primaryCompound: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  relatedCompounds: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired
  })),
  description: PropTypes.string
});


export {
  compoundShape
};
