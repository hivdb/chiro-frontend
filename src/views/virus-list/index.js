import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';


class VirusListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    viruses: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      viruses
    } = this.props;

    return <Grid stackable className={style['virus-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <p>
              {viruses.totalCount} virus
              {viruses.totalCount > 1 ? 'es are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {sortBy(viruses.edges, ['ordinal']).map(
                ({node: {
                  name,
                  fullName,
                  synonyms,
                  typeName,
                  relatedViruses,
                  experimentCounts,
                  description
                }}, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header
                       as={Link}
                       to={{
                         pathname: '/search/',
                         query: {'virus': name}
                       }}>
                        {name}
                      </Item.Header>
                      <Item.Extra>
                        <Link to={{
                          pathname: '/search/',
                          query: {'virus': name}
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
                        </Link>
                      </Item.Extra>
                      <Item.Meta>
                        {fullName ? <span className={style['full-name']}>
                          {fullName}
                        </span> : null}
                      </Item.Meta>
                      <Item.Description>
                        {description}
                      </Item.Description>
                      <Item.Extra>
                        {typeName ? <span className={style.type}>
                          {typeName}
                        </span> : null}
                        {relatedViruses.length > 0 ? (
                          <span className={style['related-viruses']}>
                            {relatedViruses.map(
                              ({name}) => name).join(', ')}
                          </span>
                        ) : null}
                      </Item.Extra>
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


export default function VirusList({match, ...props}) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <VirusListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <VirusListInner
     {...props}
     {...data} />
  );
}
