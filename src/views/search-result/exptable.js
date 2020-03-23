import React from 'react';
import PropTypes from 'prop-types';
import nestedGet from 'lodash/get';
import {Table} from 'semantic-ui-react';


function getNextDirection(direction) {
  if (direction === null) {
    return 'ascending';
  }
  else if (direction === 'ascending') {
    return 'descending';
  }
  else {
    return null;
  }
}


export default class ExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string,
    columnDefs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
      sort: PropTypes.func.isRequired
    })),
    data: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ).isRequired
  }

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      sortedByColumn: null,
      sortedData: data,
      sortDirection: null
    };
  }

  componentDidUpdate(prevProps) {
    const {cacheKey, data} = this.props;
    if (prevProps.cacheKey !== cacheKey) {
      // cache key was updated
      this.setState({
        sortedByColumn: null,
        sortedData: data,
        sortDirection: null
      });
    }
  }

  handleSort(column, sortFunc) {
    return () => {
      let {sortedByColumn, sortDirection, sortedData} = this.state;

      if (column === sortedByColumn) {
        sortDirection = getNextDirection(sortDirection);
      }
      else {
        sortDirection = 'ascending';
      }
      sortedByColumn = column;

      if (sortDirection === null) {
        const {data} = this.props;
        sortedData = data;
      }
      else if (sortDirection === 'ascending') {
        sortedData = sortFunc(sortedData);
      }
      else { // descending
        sortedData = sortedData.reverse();
      }

      this.setState({
        sortedByColumn,
        sortedData,
        sortDirection
      });
    };
  }

  render() {
    const {columnDefs} = this.props;
    const {sortedByColumn, sortedData, sortDirection} = this.state;

    return <Table basic="very" sortable celled compact selectable>
      <Table.Header>
        <Table.Row>
          {columnDefs.map(({name, label, sort}, idx) => (
            <Table.HeaderCell
             sorted={sortedByColumn === name ? sortDirection : null}
             onClick={this.handleSort(name, sort)}
             key={idx}>
              {label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((row, idx) => (
          <Table.Row key={idx}>
            {columnDefs.map(({name, render}, jdx) => (
              <Table.Cell key={jdx}>
                {render(nestedGet(row, name), row)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>;
  }
}
