import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from './toc';
import Collapsable from './collapsable';
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
      {({hasReference}) => hasReference() ? (
        <Collapsable.Section level={2} data-section-reference="">
          <HeadingTag level={2}>{referenceTitle}</HeadingTag>
          <References />
        </Collapsable.Section>
      ) : null}
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


function getHeadingLevel(node) {
  if (node.type === HeadingTag) {
    return node.props.level;
  }
  else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.type)) {
    return parseInt(node.type.slice(1, 2));
  }
  else {
    return -1;
  }
}


function groupSections(nodes, startIdx = 0, minLevel = 1) {
  const sections = [];
  let curSectionLevel = 0;
  let curSectionParas = [];
  for (let idx = startIdx; idx < nodes.length; idx ++) {
    const node = nodes[idx];
    const level = getHeadingLevel(node);
    if (level < 0) {
      // not a heading tag
      curSectionParas.push(node);
    }
    else if (level >= minLevel) {
      if (curSectionLevel === 0 || level <= curSectionLevel) {
        // new section
        pushSection(curSectionParas, curSectionLevel);
        curSectionLevel = level;
        curSectionParas = [node];
      }
      else {
        // new subsection
        const [subsections, endIdx] = groupSections(nodes, idx, level);
        idx = endIdx;
        curSectionParas = [
          ...curSectionParas,
          ...subsections
        ];
      }
    }
    else { // level > 0 and level < minLevel
      pushSection(curSectionParas, curSectionLevel);
      return [sections, idx - 1];
    }
  }
  pushSection(curSectionParas, curSectionLevel);
  return [sections, nodes.length];

  function pushSection(sectionParas, level) {
    if (sectionParas.length > 0) {
      sections.push(
        <Collapsable.Section
         key={`section-${startIdx}-${sections.length}-${level}`}
         level={level}>
          {sectionParas}
        </Collapsable.Section>
      );
    }
  }
}


function renderRoot({children}) {
  children = groupSections(children)[0];
  return <>{children}</>;
}


export default class Markdown extends React.Component {

  static propTypes = {
    toc: PropTypes.bool.isRequired,
    children: PropTypes.string.isRequired,
    tocClassName: PropTypes.string,
    inline: PropTypes.bool.isRequired,
    renderers: PropTypes.object.isRequired,
    collapsableLevels: PropTypes.array,
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
      referenceTitle, inline, tocClassName,
      collapsableLevels,
      renderers: addRenderers, ...props
    } = this.props;
    const renderers = {
      link: MarkdownLink,
      footnote: RefLink,
      footnoteReference: RefLink,
      footnoteDefinition: RefDefinition,
      // table: SimpleTableContainer,
      parsedHtml,
      ...(inline ? {} : {root: renderRoot}),
      ...(noHeadingStyle ? null : {heading: HeadingTag}),
      ...(inline ? {paragraph: ({children}) => <>{children}</>} : null),
      ...addRenderers
    };
    const context = new ReferenceContextValue();
    let jsx = (
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
    if (collapsableLevels && collapsableLevels.length > 0) {
      jsx = <Collapsable levels={collapsableLevels}>{jsx}</Collapsable>;
    }
    if (toc) {
      return <AutoTOC className={tocClassName}>{jsx}</AutoTOC>;
    }
    else {
      return jsx;
    }
  }

}
