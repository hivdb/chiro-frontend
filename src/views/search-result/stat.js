import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header} from 'semantic-ui-react';

import style from './style.module.scss';


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
    columnWidth: 3
  }

  render() {
    const {children, columnWidth} = this.props;

    return <>
      {children.map(({title, cells}, idx) => (
        <Grid.Column key={idx} width={columnWidth}>
          <Header as='h2' dividing>
            {title}
          </Header>
          <div className={style['stat-list']}>
            {cells.map(({label, value}, jdx) => (
              <div className={style['stat-item']} key={jdx}>
                <div className={style['item-label']}>{label}</div>
                <div className={style['item-value']}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Grid.Column>
      ))}
    </>;
  }

}
