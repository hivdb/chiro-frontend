import PropTypes from 'prop-types';

const compoundShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  synonyms: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  drugClassName: PropTypes.string,
  availability: PropTypes.string,
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

const virusExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articleNicknames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ),
      virusName: PropTypes.string.isRequired,
      strainName: PropTypes.string,
      virusInput: PropTypes.string,
      virusEndpoint: PropTypes.string,
      virusMeasurement: PropTypes.string,
      drugConcentration: PropTypes.string,
      drugTiming: PropTypes.string,
      durationOfInfection: PropTypes.string,
      ec50cmp: PropTypes.string,
      ec50: PropTypes.number,
      ec50unit: PropTypes.string,
      cc50cmp: PropTypes.string,
      cc50: PropTypes.number,
      cc50unit: PropTypes.string
    })
  }))
});

export {compoundShape, virusExperimentsShape};
