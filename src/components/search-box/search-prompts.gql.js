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
    compounds {
      edges {
        node {
          name
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
  }
`;
