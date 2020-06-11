import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $compoundTargetName: String
    $categoryName: String
  ) {

    updateTime(title: "clinical-trials") {
      updateTime
    }

    compounds(completeList: true) {
      edges {
        node {
          name
          synonyms
          description
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
