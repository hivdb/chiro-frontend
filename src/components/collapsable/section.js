import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import {withRouter, matchShape, routerShape} from 'found';

import {getAnchor, HeadingTag} from '../heading-tags';

import Context from './context';
import style from './style.module.scss';


class SectionInner extends React.Component {

  static propTypes = {
    level: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    registerCollapsableAnchor: PropTypes.func.isRequired,
    getClosestCollapsableAnchor: PropTypes.func.isRequired
  }

  static getCurAnchor = (props) => {
    let {
      match: {location},
      getClosestCollapsableAnchor
    } = props;
    let curHash = null;
    if (location.hash) {
      curHash = location.hash.replace(/^#/, '');
    }
    return getClosestCollapsableAnchor(curHash);
  }

  static getDefaultState = (props) => {
    let {
      children,
      registerCollapsableAnchor
    } = props;
    let anchor = null;
    if (!(children instanceof Array)) {
      children = [children];
    }
    for (const child of children) {
      if (child && child.type === HeadingTag) {
        anchor = getAnchor(child);
        registerCollapsableAnchor(anchor);
      }
    }
    const {anchor: curAnchor} = this.getCurAnchor(props);
    return {
      expanded: anchor === curAnchor,
      isDefaultState: true,
      myAnchor: anchor,
      curAnchor
    };
  }

  static getDerivedStateFromProps = (props, state) => {
    const {
      anchor: curAnchor,
      shouldCollapseOther
    } = this.getCurAnchor(props);
    if (
      curAnchor !== null &&
      (shouldCollapseOther || state.myAnchor === curAnchor) &&
      curAnchor !== state.curAnchor
    ) {
      return this.getDefaultState(props);
    }
    return state;
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDefaultState(this.props);
    this.sectionRef = React.createRef();
  }

  get maxHeight() {
    if (this.state.isDefaultState) {
      return 'max-content';
    }
    else if (this.sectionRef.current) {
      return this.sectionRef.current.scrollHeight + 20;
    }
    return null;
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
    const {
      level, children, match, router,
      registerCollapsableAnchor,  // unused
      getClosestCollapsableAnchor,  // unused
      ...props
    } = this.props;
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

    return (
      <section {...props} ref={this.sectionRef}>
        <a
         {...eventProps}
         className={style['toggle-display']}
         href="#toggle-display">
          {expanded ?
            <Icon name="minus circle" aria-label="expand" /> :
            <Icon name="plus circle" aria-label="collapse" />}
        </a>
        {children}
      </section>
    );
  }

}


class Section extends React.Component {

  render() {
    return <Context.Consumer>
      {({
        registerCollapsableAnchor,
        getClosestCollapsableAnchor
      }) => (
        <SectionInner
         {...this.props}
         {...{
           registerCollapsableAnchor,
           getClosestCollapsableAnchor
         }} />
      )}
    </Context.Consumer>;
  }

}


export default withRouter(Section);
