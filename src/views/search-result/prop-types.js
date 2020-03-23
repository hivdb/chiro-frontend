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
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired,
        pmid: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired,
        doi: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      strainName: PropTypes.string,
      compoundObj: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      cellsObj: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      virusInput: PropTypes.string,
      measurement: PropTypes.string,
      ec50cmp: PropTypes.string,
      ec50: PropTypes.number,
      ec50unit: PropTypes.string,
      sicmp: PropTypes.string,
      si: PropTypes.number
    })
  }))
});

const biochemExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      compoundObj: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      targetObj: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      ic50cmp: PropTypes.string,
      ic50: PropTypes.number,
      ic50unit: PropTypes.string
    })
  }))
});

export {
  compoundShape, virusExperimentsShape,
  biochemExperimentsShape
};
