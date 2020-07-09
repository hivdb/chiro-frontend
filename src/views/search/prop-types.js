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

const virusExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      virusStrainName: PropTypes.string,
      compoundNames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired,
      cellsObj: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string
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


const entryAssayExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      compoundNames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired,
      measurement: PropTypes.string,
      effectorCellsName: PropTypes.string,
      ec50cm: PropTypes.string,
      ec50: PropTypes.number,
      ec50unit: PropTypes.string,
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
      compoundNames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired,
      targetName: PropTypes.string.isRequired,
      ic50cmp: PropTypes.string,
      ic50: PropTypes.number,
      ic50unit: PropTypes.string
    })
  }))
});


const animalExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      compoundNames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    })
  }))
});


const clinicalExperimentsShape = PropTypes.shape({
  totalCount: PropTypes.number.isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      articles: PropTypes.arrayOf(PropTypes.shape({
        nickname: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })).isRequired,
      virusName: PropTypes.string.isRequired,
      compoundNames: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    })
  }))
});


export {
  compoundShape, virusExperimentsShape,
  entryAssayExperimentsShape,
  biochemExperimentsShape, animalExperimentsShape,
  clinicalExperimentsShape
};
