import React from 'react';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';


class NewsInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    status: PropTypes.string.isRequired,
    code: PropTypes.string,
    message: PropTypes.string,
    articles: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    let {
      loading,
      articles
    } = this.props;

    articles = sortBy(articles, ['publishedAt']).reverse();

    return <Grid stackable className={style['news']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>
              <Header.Content>
                Latest News
                <Header.Subheader>
                  Powered by{' '}
                  <a
                   rel="noopener noreferrer"
                   href="https://newsapi.org/pricing"
                   target="_blank">
                    NewsAPI.org
                  </a>
                </Header.Subheader>
              </Header.Content>
            </Header>
            <Item.Group divided>
              {articles.filter(({source}) => source.name).map(
                ({source,
                  title,
                  description,
                  url,
                  urlToImage,
                  publishedAt
                }, idx) => (
                  <Item key={idx}>
                    {urlToImage ?
                      <Item.Image size="small" src={urlToImage} /> : null}
                    <Item.Content>
                      <Item.Header
                       as="a"
                       rel="noopener noreferrer"
                       target="_blank"
                       href={url}>
                        {title}
                      </Item.Header>
                      <Item.Meta>
                        {source.name}{' '}&bull;{' '}
                        {publishedAt ? moment(publishedAt).fromNow() : null}
                      </Item.Meta>
                      <Item.Description>
                        {description} (
                        <a
                         rel="noopener noreferrer"
                         href={url}
                         target="_blank">Read more
                        </a>
                        )
                      </Item.Description>
                    </Item.Content>
                  </Item>
                )
              )}
            </Item.Group>
          </Grid.Column>
        </Grid.Row>
      }
    </Grid>;
    
  }


}


export default function News({match, ...props}) {
  const now = new Date();
  const ts = Math.ceil(now.getTime() / 3600000) * 3600;
  let {loading, error, data} = useQuery(query, {variables: {ts}});
  if (loading) {
    return (
      <NewsInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <NewsInner
     {...props}
     {...data.news} />
  );
}
