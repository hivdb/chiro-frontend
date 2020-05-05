import React from 'react';
import ReferenceContext, {ReferenceContextValue} from './reference-context';
import RefLink from './reference-link';
import RefDefinition from './reference-definition';
import style from './style.module.scss';

export {ReferenceContext, ReferenceContextValue, RefLink, RefDefinition};


class RefItem extends React.Component {
  
  render() {
    let {
      number, itemId, linkIds, authors, title,
      journal, year, medlineId, url, children} = this.props;
    if (children) {
      if (children.length === 1 && children[0].type === 'p') {
        children = children[0].props.children;
      }
    }
    else {
      if (medlineId) {
        url = `https://www.ncbi.nlm.nih.gov/pubmed/${medlineId}`;
      }
      children = <>
        {authors}. {title}.{' '}
        <a href={url} rel="noopener noreferrer" target="_blank">
          {journal} {year}
        </a>.
      </>;
    }
    const multiLinks = linkIds.length > 1;
    return <li id={itemId}>
      {multiLinks ? <><span>^</span> </> : null}
      {linkIds.map((linkId, idx) => [
        <a key={idx} className={style['cite-back-link']} href={`#${linkId}`}>
          {multiLinks ? <sup>{number}.{idx + 1}</sup> : '^'}
        </a>,
        ' '
      ])}
      {children}
    </li>;
  }
}


export default class References extends React.Component {

  render() {
    return <ol className={style.references}>
      <ReferenceContext.Consumer>
        {({getReferences}) => getReferences().map(
          (refProps, idx) => <RefItem {...refProps} key={idx} />
        )}
      </ReferenceContext.Consumer>
    </ol>;
  }

}
