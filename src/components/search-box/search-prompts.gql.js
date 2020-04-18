import gql from 'graphql-tag';

export default gql`
  query SearchPrompts {
    articles {
      edges {
        node {
          nickname
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
    compounds(completeList: true) {
      edges {
        node {
          name
          status
          targetObj {
            name
            relatedCompoundTargets {
              name
            }
          }
        }
      }
    }
    viruses {
      edges {
        node {
          name
        }
      }
    }
    clinicalTrialCategories {
      edges {
        node {
          name
        }
      }
    }
  }
`;
