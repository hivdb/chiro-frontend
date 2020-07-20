import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import {withRouter, matchShape, routerShape} from 'found';

import {getAnchor, HeadingTag} from '../heading-tags';

import style from './style.module.scss';


class Section extends React.Component {

  static propTypes = {
    level: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired
  }

  static getDefaultState(props) {
    let {match: {location}, children} = props;
    let curHash = null;
    let anchor = null;
    if (location.hash) {
      curHash = location.hash.replace(/^#/, '');
    }
    if (!(children instanceof Array)) {
      children = [children];
    }
    for (const child of children) {
      if (child && child.type === HeadingTag) {
        anchor = getAnchor(child);
      }
    }
    return {
      expanded: anchor === curHash,
      isDefaultState: true,
      curHash
    };
  }

  static getDerivedStateFromProps(props, state) {
    const newState = Section.getDefaultState(props);
    if (newState.curHash !== state.curHash) {
      return newState;
    }
    return state;
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDefaultState(this.props);
    this.sectionRef = React.createRef();
  }

  get maxHeight() {
    return (
      this.sectionRef.current ?
        this.sectionRef.current.scrollHeight + 20 :
        null
    );
  }

  toggleDisplay = (e) => {
    e && e.preventDefault();
    const {expanded} = this.state;
    this.setState({
      expanded: !expanded,
      isDefaultState: false
    });
  }

  render() {
    const {level, children, ...props} = this.props;
    const {expanded, isDefaultState} = this.state;
    const {maxHeight} = this;
    if (expanded) {
      props['data-expanded'] = '';
    }
    props['data-level'] = level;
    const eventProps = {
      onTouchStart: this.toggleDisplay,
      onTouchEnd: e => e.preventDefault(),
      onClick: this.toggleDisplay
    };
    if (expanded) {
      props.style = {maxHeight};
    }
    if (isDefaultState) {
      props.style = props.style || {};
      props.style.transition = 'none';
    }
    if (maxHeight === null) {
      setTimeout(() => this.forceUpdate(), 0);
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


export default withRouter(Section);
