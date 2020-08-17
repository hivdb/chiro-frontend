import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import * as queryString from 'query-string';
import OrigMarkdown from 'react-markdown/with-html';
import * as youtubeUrl from 'youtube-url';

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


function OptReferences(props) {
  const {level, disableAnchor, referenceTitle} = props;
  return <ReferenceContext.Consumer>
    {({hasReference}) => hasReference() ? (
      <Collapsable.Section level={level} data-section-reference="">
        <HeadingTag {...{disableAnchor, level}}>{referenceTitle}</HeadingTag>
        <References />
      </Collapsable.Section>
    ) : null}
  </ReferenceContext.Consumer>;
}


function MdHeadingTag(disableAnchor) {
  return props => <HeadingTag {...{disableAnchor}} {...props} />;
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


function renderImage(imagePrefix) {
  return ({src, alt, ...props}) => {
    let style;
    [src, style] = src.split(/#!(?=[^#]+$)/);
    if (style) {
      style = queryString.parse(style);
      style = {...style};  // the object from queryString is null-prototype
    }
    if (youtubeUrl.valid(src)) {
      const youtubeId = youtubeUrl.extractId(src);
      return (
        <iframe
         {...props}
         style={style}
         title={alt}
         src={`https://www.youtube.com/embed/${youtubeId}`}
         frameBorder="0"
         allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
         allowFullScreen />
      );
    }
    src = src && /https?:\/\//i.test(src) ? src : `${imagePrefix}${src}`;
    return <img {...props} alt={alt} src={src} style={style} />;
  };
}


export default class Markdown extends React.Component {

  static propTypes = {
    toc: PropTypes.bool.isRequired,
    children: PropTypes.string.isRequired,
    tocClassName: PropTypes.string,
    inline: PropTypes.bool.isRequired,
    renderers: PropTypes.object.isRequired,
    collapsableLevels: PropTypes.array,
    disableHeadingTagAnchor: PropTypes.bool.isRequired,
    noHeadingStyle: PropTypes.bool.isRequired,
    referenceTitle: PropTypes.string.isRequired,
    referenceHeadingTagLevel: PropTypes.number.isRequired
  }

  static defaultProps = {
    toc: false,
    inline: false,
    renderers: {},
    noHeadingStyle: false,
    referenceTitle: 'References',
    disableHeadingTagAnchor: false,
    referenceHeadingTagLevel: 2
  }

  render() {
    const {
      children, noHeadingStyle, toc,
      referenceTitle, inline, tocClassName,
      disableHeadingTagAnchor,
      referenceHeadingTagLevel,
      collapsableLevels, imagePrefix,
      renderers: addRenderers, ...props
    } = this.props;
    const renderers = {
      link: MarkdownLink,
      image: renderImage(imagePrefix),
      footnote: RefLink,
      footnoteReference: RefLink,
      footnoteDefinition: RefDefinition,
      // table: SimpleTableContainer,
      parsedHtml,
      ...(inline ? {} : {root: renderRoot}),
      ...(noHeadingStyle ? null : {
        heading: MdHeadingTag(disableHeadingTagAnchor)
      }),
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
        <OptReferences
         disableAnchor={disableHeadingTagAnchor}
         level={referenceHeadingTagLevel}
         {...{referenceTitle}} />
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
