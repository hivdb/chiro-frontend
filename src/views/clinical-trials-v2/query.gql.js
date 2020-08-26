import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $compoundTargetName: String
    $categoryName: String
    $noRelatedCompounds: Boolean!
  ) {

    updateTime(title: "clinical-trials") {
      updateTime
    }

    compounds(
      completeList: true,
      withNonantiviral: true
      ) {
      edges {
        node {
          name
          synonyms
          description
          clinicalTrialCount
        }
      }
    }

    clinicalTrialCategories {
      edges {
        node {
          name
          displayName
          ordinal
        }
      }
    }

    compoundTargets {
      edges {
        node {
          name
        }
      }
    }

    clinicalTrials(
      compoundName: $compoundName,
      compoundTargetName: $compoundTargetName,
      noRelatedCompounds: $noRelatedCompounds,
      categoryName: $categoryName
    ) {
      totalCount
      edges {
        node {
          trialNumbers
          categoryNames
          recruitmentStatus
          hasTreatmentGroup
          hasPreventionGroup
          treatmentPopulation
          intervention
          dosage
          outcome
          region
          regionDetail
          numParticipants
          startDate
          stopDate
          dateEntered
          attachedTextObjs {
            type
            content
          }
          compoundObjs {
            target
            primaryCompound {
              name
            }
            relatedCompounds {
              name
            }
          }
          articles {
            nickname
          }
        }
      }
    }
  }
`;
