import gql from 'graphql-tag';

export default gql`
  query compoundList(
    $compoundTargetName: String
    $withCompoundTarget: Boolean!
    $isTargetMAb: Boolean!
    $isNotTargetMAb: Boolean!
  ) {
    compoundTarget(name: $compoundTargetName)
    @include(if: $withCompoundTarget) {
      name
      description
    }
    compounds(
      compoundTargetName: $compoundTargetName
      completeList: true
    ) {
      totalCount
      edges {
        node {
          name
          synonyms
          target
          category
          drugClassName
          molecularFormula
          molecularWeight
          smiles
          pubchemCid
          casNumber
          relatedCompounds {
            name
          }
          articles {
            nickname
            doi
          }
          hasExperiments
          experimentCounts @include(if: $isNotTargetMAb) {
            count
          }
          clinicalTrialObjs @include(if: $isTargetMAb) {
            trialNumbers
          }
          antibodyData @include(if: $isTargetMAb) {
            targetVirusName
            abdabAvailability
            source
            pdb
            animalModel
          }
          ec50Data @include(if: $isTargetMAb) {
            expCategoryName
            articles { nickname doi }
            ec50cmp
            ec50
            ec50unit
            ec50inactive
          }
          description
        }
      }
    }
  }
`;
