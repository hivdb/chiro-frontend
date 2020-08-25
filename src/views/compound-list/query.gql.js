import gql from 'graphql-tag';

export default gql`
  query compoundList(
    $compoundTargetName: String
    $withCompoundTarget: Boolean!
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
          relatedCompounds {
            name
          }
          articles {
            nickname
            doi
          }
          experimentCounts {
            count
          }
          antibodyData {
            targetVirusName
            abdabAvailability
            source
            pdb
            epitope
            animalModel
          }
          description
        }
      }
    }
  }
`;
