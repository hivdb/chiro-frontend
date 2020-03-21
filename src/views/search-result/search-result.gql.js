import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String!
  ) {
    compound(name: $compoundName) {
      name
      synonyms
      drugClassName
      availability
      target
      molecularWeight
      isPrimaryCompound
      primaryCompound { name }
      relatedCompounds { name }
      description
    }

    virusExperiments(compoundName: $compoundName) {
      totalCount
      edges {
        node {
          articles { nickname }
          virusName
          strainName
          virusInput
          virusEndpoint
          virusMeasurement
          drugConcentration
          drugTiming
          durationOfInfection
          ec50cmp
          ec50
          ec50unit
          cc50cmp
          cc50
          cc50unit
          sicmp
          si
        }
      }
    }
  }
`;
