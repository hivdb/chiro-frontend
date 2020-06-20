import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from './toc';
import {HeadingTag} from './heading-tags';
import References, {
  ReferenceContext, ReferenceContextValue,
  RefLink, RefDefinition
} from './references';


class MarkdownLink extends React.Component {

  static propTypes = {
    href: PropTypes.string.isRequired
  }

  getTarget(href, props) {
    let {target} = props;
    if (target) {
      return target;
    }
    if (/^(https?:\/\/|\/\/)/gi.test(href)) {
      return '_blank';
    }
    return null;
  }

  renderLink(href, props) {
    const {children, ...others} = props;
    const target = this.getTarget(href, props);
    if (target == null) {
      return <Link to={href} {...props} />;
    }
    else {
      return (
        <a href={href}
         {...others}
         rel="noopener noreferrer"
         target={target}>
          {children}
        </a>
      );
    }
  }

  render() {
    let type = 'link';
    let {href, ...props} = this.props;
    if (href.startsWith('!')) {
      [type, href] = href.split(/:/);
      type = type.slice(1);
      href = href ? href.trim() : href;
    }
    switch (type) {
      // case 'gist':
      //   return this.renderGist(href, props);
      case 'link':
      default:
        return this.renderLink(href, props);
    }
  }
}


class OptReferences extends React.Component {

  render() {
    const {referenceTitle} = this.props;
    return <ReferenceContext.Consumer>
      {({hasReference}) => hasReference() ? <>
        <HeadingTag level={2}>{referenceTitle}</HeadingTag>
        <References />
      </> : null}
    </ReferenceContext.Consumer>;
  }

}


function parsedHtml({element, escapeHtml, skipHtml, value}) {
  if (skipHtml) {
    return null;
  }
  if (escapeHtml) {
    return value;
  }
  /*if (element.type === 'table') {
    return <SimpleTableContainer layout="auto">
      {element}
    </SimpleTableContainer>;
  }*/
  return element;
}


export default class Markdown extends React.Component {

  static propTypes = {
    toc: PropTypes.bool.isRequired,
    children: PropTypes.string.isRequired,
    inline: PropTypes.bool.isRequired,
    renderers: PropTypes.object.isRequired,
    noHeadingStyle: PropTypes.bool.isRequired,
    referenceTitle: PropTypes.string.isRequired
  }

  static defaultProps = {
    toc: false,
    inline: false,
    renderers: {},
    noHeadingStyle: false,
    referenceTitle: 'References'
  }

  render() {
    const {
      children, noHeadingStyle, toc,
      referenceTitle, inline,
      renderers: addRenderers, ...props
    } = this.props;
    const renderers = {
      link: MarkdownLink,
      footnote: RefLink,
      footnoteReference: RefLink,
      footnoteDefinition: RefDefinition,
      // table: SimpleTableContainer,
      parsedHtml,
      ...(noHeadingStyle ? null : {heading: HeadingTag}),
      ...(inline ? {paragraph: ({children}) => <>{children}</>} : null),
      ...addRenderers
    };
    const context = new ReferenceContextValue();
    const jsx = (
      <ReferenceContext.Provider value={context}>
        <OrigMarkdown
         source={children}
         renderers={renderers}
         parserOptions={{footnotes: true}}
         transformLinkUri={false}
         {...props}
        />
        <OptReferences {...{referenceTitle}} />
      </ReferenceContext.Provider>
    );
    if (toc) {
      return <AutoTOC>{jsx}</AutoTOC>;
    }
    else {
      return jsx;
    }
  }

}
