import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $compoundTargetName: String
    $virusName: String
    $articleNickname: String
    $withCompound: Boolean!
    $withCompoundTarget: Boolean!
    $withVirus: Boolean!
    $withArticle: Boolean!
    $enableQuery: Boolean!
    $noRelatedCompounds: Boolean!
  ) {
    compound(name: $compoundName) @include(if: $withCompound) {
      name
      description
      targetObj { name description }
    }

    compoundTarget(name: $compoundTargetName)
    @include(if: $withCompoundTarget) {
      name
      description
    }

    virus(name: $virusName) @include(if: $withVirus) {
      name
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
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      virusName: $virusName,
      articleNickname: $articleNickname
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          categoryName
          articles {
            nickname year
          }
          virusName
          virusStrainName
          compoundNames
          compoundObjs {
            target
          }
          cellsObj { name description }
          moi { mean lower }
          measurementObj { name description }
          drugTiming { text lower upper }
          durationOfInfection { text lower upper }
          ec50cmp
          ec50
          ec50unit
          ec50inactive
          pcntInhibition
          sicmp
          si
        }
      }
    }

    pseudovirusExperiments: pseudovirusExperiments(
      compoundName: $compoundName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      virusName: $virusName,
      articleNickname: $articleNickname
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          articles {
            nickname year
          }
          virusName
          virusStrainName
          compoundNames
          compoundObjs {
            target
          }
          cellsObj { name description }
          numberOfCells { mean lower } 
          moi { mean lower }
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

    fusionAssayExperiments: fusionAssayCellCultureExperiments(
      compoundName: $compoundName,
      virusName: $virusName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      articleNickname: $articleNickname,
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          articles {
            nickname year
          }
          virusName
          virusStrainName
          compoundNames
          compoundObjs {
            target
          }
          cellsObj { name description }
          measurementObj { name description }
          drugTiming { text lower upper }
          ec50cmp
          ec50
          ec50unit
          ec50inactive
          effectorCellsObj { name description }
        }
      }
    }

    biochemExperiments(
      compoundName: $compoundName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      virusName: $virusName,
      articleNickname: $articleNickname
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          articles {
            nickname year
          }
          virusName
          virusStrainName
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
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      virusName: $virusName,
      articleNickname: $articleNickname
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          articles {
            nickname year
          }
          virusName
          virusStrainName
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
    clinicalExperiments (
      compoundName: $compoundName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      virusName: $virusName,
      articleNickname: $articleNickname
    ) @include(if: $enableQuery) {
      totalCount
      edges {
        node {
          articles {
            nickname year journal journalAbbr
            publishDate
          }
          virusName
          compoundNames
          regimenDetail
          studyTypeName
          studyTypeOrdinal
          numSubjects
          attachedTextObjs {
            type
            content
          }
        }
      }
    }
    clinicalTrials(
      compoundName: $compoundName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds
    ) @include(if: $enableQuery) {
      totalCount
    }
  }
`;
