import gql from 'graphql-tag';

export default gql`
  query searchResult(
    $articleNickname: String
  ) {
    article(nickname: $articleNickname) {
      nickname
      pmid doi pmcid
      title journal
      authors {
        surname
        givenNames
      }
      year
    }
  }
`;
