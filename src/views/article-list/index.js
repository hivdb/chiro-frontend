import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Header, Loader} from 'semantic-ui-react';

import ArticleInfo from '../../components/article-info';
import query from './query.gql.js';
import style from './style.module.scss';


class ArticleListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    articles: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      articles
    } = this.props;

    return <Grid stackable className={style['article-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h2">References</Header>
            <ol>
              {articles.edges.map(
                ({node: {experimentCounts, nickname, ...node}}, idx) => (
                  <li key={idx}>
                    <ArticleInfo {...node} />{' '}
                    (<Link to={{
                      pathname: '/search',
                      query: {article: nickname[0]}
                    }}>
                      {(() => {
                        const total = experimentCounts.reduce(
                          (acc, {count}) => acc + count, 0
                        );
                        if (total > 1) {
                          return `${total} experiment results`;
                        }
                        else {
                           return `${total} experiment result`;
                        }
                      })()}
                    </Link>)
                  </li>
                )
              )}
            </ol>
          </Grid.Column>
        </Grid.Row>
      }
    </Grid>;
    
  }


}


export default function ArticleList({match, ...props}) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <ArticleListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <ArticleListInner
     {...props}
     {...data} />
  );
}
