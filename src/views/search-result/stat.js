import React from 'react';
import PropTypes from 'prop-types';
import {Grid, List, Header} from 'semantic-ui-react';


export default class StatTable extends React.Component {

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      cells: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.node.isRequired,
          value: PropTypes.node
        })
      )
    })),
    columnWidth: PropTypes.number.isRequired
  }

  static defaultProps = {
    columnWidth: 2
  }

  render() {
    const {children, columnWidth} = this.props;

    return <>
      {children.map(({title, cells}, idx) => (
        <Grid.Column key={idx} width={columnWidth}>
          <Header as='h4' dividing>
            {title}
          </Header>
          <List relaxed>
            {cells.map(({label, value}, jdx) => (
              <List.Item key={jdx}>
                <List.Content floated="right">
                  {value}
                </List.Content>
                <List.Content>{label}</List.Content>
              </List.Item>
            ))}
          </List>
        </Grid.Column>
      ))}
    </>;
  }

}
