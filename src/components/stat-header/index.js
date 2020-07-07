import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header} from 'semantic-ui-react';

import style from './style.module.scss';


export default class StatHeader extends React.Component {

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.shape({
      width: PropTypes.number,
      className: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.node,
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
      {children.map(({title, description, className, width, cells}, idx) => (
        <Grid.Column
         key={idx}
         className={className}
         width={width ? width : columnWidth}>
          {title ? <Header as='h2' dividing>
            {title}
          </Header> : null}
          {description ? description : null}
          {cells ? (
            <div className={style['stat-list']}>
              {cells.map(({label, value}, jdx) => (
                <div
                 className={style['stat-item']}
                 key={jdx} data-type-item-container>
                  <div
                   className={style['item-label']}
                   data-type-item-label>
                    {label}
                  </div>
                  <div
                   className={style['item-value']}
                   data-type-item-value>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Grid.Column>
      ))}
    </>;
  }

}
