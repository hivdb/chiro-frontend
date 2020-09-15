import React from 'react';
import PropTypes from 'prop-types';
import OrigMarkdown from 'react-markdown/with-html';

import {AutoTOC} from '../toc';
import Collapsable from '../collapsable';
import {
  ReferenceContext, ReferenceContextValue,
  RefLink, RefDefinition
} from '../references';

import MarkdownLink from './link';
import OptReferences from './references';
import MdHeadingTag from './heading-tags';
import RootWrapper from './root-wrapper';
import ImageWrapper from './image-wrapper';
import macroPlugin, {BadMacroNode} from './macro-plugin';
import TableNodeWrapper from './macro-table';


/*function parsedHtml({element, escapeHtml, skipHtml, value}) {
  if (skipHtml) {
    return null;
  }
  if (escapeHtml) {
    return value;
  }
  return element;
}*/


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
    referenceHeadingTagLevel: PropTypes.number.isRequired,
    imagePrefix: PropTypes.string.isRequired,
    tables: PropTypes.objectOf(PropTypes.shape({
      columnDefs: PropTypes.array.isRequired,
      data: PropTypes.array.isRequired
    }).isRequired).isRequired
  }

  static defaultProps = {
    toc: false,
    inline: false,
    renderers: {},
    noHeadingStyle: false,
    referenceTitle: 'References',
    disableHeadingTagAnchor: false,
    referenceHeadingTagLevel: 2,
    imagePrefix: '/',
    tables: {}
  }

  render() {
    const {
      children, noHeadingStyle, toc,
      referenceTitle, inline, tocClassName,
      disableHeadingTagAnchor,
      referenceHeadingTagLevel,
      collapsableLevels, imagePrefix, tables,
      renderers: addRenderers, ...props
    } = this.props;
    const renderers = {
      link: MarkdownLink,
      image: ImageWrapper({imagePrefix}),
      footnote: RefLink,
      footnoteReference: RefLink,
      footnoteDefinition: RefDefinition,
      BadMacroNode,
      TableNode: TableNodeWrapper({tables}),
      // table: SimpleTableContainer,
      // parsedHtml,
      ...(inline ? {} : {root: RootWrapper}),
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
         plugins={[macroPlugin.transformer]}
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
