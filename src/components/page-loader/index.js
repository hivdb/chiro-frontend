import React from 'react';
import PropTypes from 'prop-types';

import {loadPage} from '../../utils/cms';
import PromiseComponent from '../../utils/promise-component';


export default class PageLoader extends React.Component {

  static propTypes = {
    pageName: PropTypes.string.isRequired,
    component: PropTypes.func,
    children: PropTypes.func
  }

  static getDerivedStateFromProps(props, state) {
    const {pageName} = props;
    if (pageName !== state.pageName) {
      state.promise = loadPage(`page-${pageName}`);
      // _scrollTops = {};
    }
    /* else {
      setTimeout(() => {
        _scrollTops[pageName] = window.pageYOffset;
      }, 0);
    } */
    // updateScroll(props);
    return state;
  }

  constructor() {
    super(...arguments);
    const {pageName} = this.props;
    const promise = loadPage(`page-${pageName}`);
    this.state = {promise, pageName};
  }

  errorRender = () => {
    return "Page not found.";
  };

  render() {
    const {component, children} = this.props;
    const {promise} = this.state;
    const props = {promise, error: this.errorRender};
    if (component) {
      props.component = component;
    }
    else {
      props.then = children;
    }

    return <PromiseComponent {...props} />;
  }
}
