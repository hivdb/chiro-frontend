import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $virusName: String
    $articleNickname: String
    $withCompound: Boolean!
    $withVirus: Boolean!
    $withArticle: Boolean!

  ) {
    compound(name: $compoundName) @include(if: $withCompound) {
      name
      synonyms
      drugClassName
      category
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

    article(nickname: $articleNickname) @include(if: $withArticle) {
      nickname
      pmid doi pmcid
      title journal
      authors {
        surname
        givenNames
      }
      year
    }

    virusExperiments: virusInCellCultureExperiments(
      compoundName: $compoundName,
      virusName: $virusName,
      articleNickname: $articleNickname
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
          moi { text lower upper }
          measurement
          drugTiming { text lower upper }
          durationOfInfection { text lower upper }
          ec50cmp
          ec50
          ec50unit
          ec50inactive
          sicmp
          si
        }
      }
    }

    biochemExperiments(
      compoundName: $compoundName,
      virusName: $virusName,
      articleNickname: $articleNickname
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
          ic50inactive
        }
      }
    }
    animalExperiments (
      compoundName: $compoundName,
      virusName: $virusName,
      articleNickname: $articleNickname
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
