import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


class CellCultureMeasurementListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    cellCultureMeasurements: PropTypes.object
  };

  static defaultProps = {
    loading: false
  };

  render() {
    const {loading, cellCultureMeasurements} = this.props;
    setTitle('Cell Culture Measurements');

    return <Grid stackable className={style['cell-culture-measurement-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>Cell Culture Measurements</Header>
            <p>
              {cellCultureMeasurements.totalCount} measurement
              {cellCultureMeasurements.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {cellCultureMeasurements.edges.map(
                ({
                  node: {name, fullName, description}
                }, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header>{name}</Item.Header>
                      <Item.Meta>{fullName}</Item.Meta>
                      <Item.Description>
                        {description}
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


export default function CellCultureMeasurementList(props) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <CellCultureMeasurementListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <CellCultureMeasurementListInner
     {...props}
     {...data} />
  );
}
