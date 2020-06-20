import PropTypes from 'prop-types';
import React from 'react';
import sleep from 'sleep-promise';
import {Icon} from 'semantic-ui-react';

import style from './style.module.scss';


export function getChildrenText(elem) {
  if (elem === null || elem === undefined) {
    return '';
  }
  else if (elem instanceof Array) {
    if (elem.length > 0) {
      return elem.map(e => getChildrenText(e)).join('');
    }
    else {
      return ''; // TODO: empty header
    }
  }
  else if (typeof elem === 'string') {
    return elem;
  }
  else if (React.isValidElement(elem)) {
    if ('children' in elem.props) {
      return getChildrenText(elem.props.children);
    }
    else {
      const obj = new elem.type(elem.props);
      return getChildrenText(obj.render());
    }
  }
  else {
    return '';
  }
}


export function getAnchor(elem) {
  return getChildrenText(elem).toLowerCase().replace(/[^\w-]+/g, '.');
}


export class HeadingTag extends React.Component {

  static propTypes = {
    level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
    children: PropTypes.node.isRequired,
    disableAnchor: PropTypes.bool.isRequired
  }

  static defaultProps = {
    disableAnchor: false
  }

  get anchor() {
    return getAnchor(this.props.children);
  }

  async componentDidMount() {
    if (window.location.hash.replace(/^#/, '') === this.anchor) {
      await sleep(0);
      const top = (
        this.refs.elem.getBoundingClientRect().top + window.pageYOffset
      );
      window.scrollTo(0, top);
    }
  }

  render() {
    const {level, children, disableAnchor, ...props} = this.props;
    const Tag = `h${level}`;
    return (
      <Tag
       {...props}
       ref="elem"
       className={style['heading-tag']}
       id={this.anchor}>
        {disableAnchor ? null :
        <a
         href={`#${this.anchor}`}
         className={style['anchor-link']}>
          <Icon name="linkify" />
        </a>}
        {children}
      </Tag>
    );
  }

}


export class H1 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={1} />;
  }
}


export class H2 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={2} />;
  }
}


export class H3 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={3} />;
  }
}


export class H4 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={4} />;
  }
}


export class H5 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={5} />;
  }
}


export class H6 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={6} />;
  }
}
