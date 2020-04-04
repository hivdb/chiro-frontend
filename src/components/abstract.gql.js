import gql from 'graphql-tag';

export default gql`
  query articleAbstract(
    $articleNickname: String!
  ) {
    article(nickname: $articleNickname) {
      nickname
      title journal
      abstract
      year
    }
  }
`;
