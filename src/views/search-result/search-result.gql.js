import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $virusName: String
    $withCompound: Boolean!
    $withVirus: Boolean!

  ) {
    compound(name: $compoundName) @include(if: $withCompound) {
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

    virus(name: $virusName) @include(if: $withVirus) {
      name
      fullName
      synonyms
      typeName
      description
    }

    virusExperiments(
      compoundName: $compoundName,
      virusName: $virusName
    ) {
      totalCount
      edges {
        node {
          articles { nickname }
          virusName
          compoundObj {
            name
            isPrimaryCompound
            primaryCompound { name }
          }
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
