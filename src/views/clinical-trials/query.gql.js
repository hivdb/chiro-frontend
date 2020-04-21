import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $compoundTargetName: String
    $categoryName: String
  ) {

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
        }
      }
    }
  }
`;
