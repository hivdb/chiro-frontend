import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $compoundName: String
    $compoundTargetName: String
    $categoryName: String
    $withCompound: Boolean!
    $withCompoundTarget: Boolean!

  ) {
    compound(name: $compoundName) @include(if: $withCompound) {
      name
      description
      targetObj { description }
    }

    compoundTarget(name: $compoundTargetName)
    @include(if: $withCompoundTarget) {
      name
      description
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
          numParticipants
          startDate
          stopDate
        }
      }
    }
  }
`;
