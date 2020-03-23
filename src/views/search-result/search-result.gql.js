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
          strainName
          compoundObj { name target }
          cellsObj { name fullName }
          virusInput
          measurement
          ec50cmp
          ec50
          ec50unit
          sicmp
          si
        }
      }
    }

    biochemExperiments(
      compoundName: $compoundName,
      virusName: $virusName
    ) {
      totalCount
      edges {
        node {
          articles { nickname }
          virusName
          compoundObj { name }
          targetObj { name }
          ic50cmp
          ic50
          ic50unit
        }
      }
    }
  }
`;
