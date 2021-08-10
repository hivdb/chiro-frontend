import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


class CellsListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    multipleCells: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {loading, multipleCells} = this.props;
    setTitle('Cells');

    return <Grid stackable className={style['cells-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>Cells</Header>
            <p>
              {multipleCells.totalCount} cell line
              {multipleCells.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {multipleCells.edges.map(
                ({
                  node: {
                    name, fullName, synonyms,
                    relatedCells, description
                  }
                }, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header>{name}</Item.Header>
                      <Item.Meta>{fullName}</Item.Meta>
                      <Item.Description>
                        {description}
                      </Item.Description>
                      <Item.Extra>
                        {relatedCells.length > 0 ? (
                          <span className={style['related-cells']}>
                            {relatedCells.map(({name}) => name).join(', ')}
                          </span>
                        ) : null}
                        {synonyms.length > 0 ? (
                          <span className={style.synonyms}>
                            {synonyms.join(', ')}
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


export default function CellsList(props) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <CellsListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <CellsListInner
     {...props}
     {...data} />
  );
}
