import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';

import style from './style.module.scss';


export default class Section extends React.Component {

  static propTypes = {
    level: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      expanded: false,
      maxHeight: null
    };
    this.sectionRef = React.createRef();
  }

  toggleDisplay = (e) => {
    e && e.preventDefault();
    const {expanded} = this.state;
    this.setState({
      expanded: !expanded,
      maxHeight: expanded ? null : this.sectionRef.current.scrollHeight
    });
  }

  render() {
    const {level, children, ...props} = this.props;
    const {maxHeight, expanded} = this.state;
    if (expanded) {
      props['data-expanded'] = '';
    }
    props['data-level'] = level;
    const eventProps = {
      onTouchStart: this.toggleDisplay,
      onTouchEnd: e => e.preventDefault(),
      onClick: this.toggleDisplay
    };
    if (maxHeight) {
      props.style = {maxHeight};
    }

    return <section {...props} ref={this.sectionRef}>
      <a
       {...eventProps}
       className={style['toggle-display']}
       href="#toggle-display">
        {expanded ?
          <Icon name="minus circle" aria-label="expand" /> :
          <Icon name="plus circle" aria-label="collapse" />}
      </a>
      {children}
    </section>;
  }

}
