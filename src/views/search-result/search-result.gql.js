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
      category: availability
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

    virusExperiments: virusInCellCultureExperiments(
      compoundName: $compoundName,
      virusName: $virusName
    ) {
      totalCount
      edges {
        node {
          articles {
            nickname pmid doi year
          }
          virusName
          virusStrainName
          compoundNames
          cellsName
          virusInput
          measurement
          drugTiming
          durationOfInfection
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
          articles {
            nickname pmid doi year
          }
          virusName
          compoundNames
          targetName
          ic50cmp
          ic50
          ic50unit
        }
      }
    }
    animalExperiments (
      compoundName: $compoundName,
      virusName: $virusName
    ) {
      totalCount
      edges {
        node {
          articles {
            nickname pmid doi year
          }
          virusName
          compoundNames
          animalModelName
          animalModelDetail
          inoculation
          treatmentType
          numSubjects
          numControls
          dose
          treatmentTime
          resultObjs {
            resultName
            result
          }
        }
      }
    }
  }
`;
