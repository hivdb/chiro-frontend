import React from 'react';
import ReferenceContext, {ReferenceContextValue} from './reference-context';
import RefLink from './reference-link';
import RefDefinition from './reference-definition';
import buildRef from './build-ref';
import style from './style.module.scss';
import LoadReferences from './load-references';

export {ReferenceContext, ReferenceContextValue, RefLink, RefDefinition};


class RefItem extends React.Component {

  handleClick = (evt) => {
    const {href} = evt.currentTarget.attributes;
    const anchor = href.value.slice(1);
    setTimeout(() => {
      const elem = document.getElementById(anchor);
      if (elem) {
        elem.scrollIntoViewIfNeeded();
        elem.dataset.anchorFocused = true;
        setTimeout(() => {
          delete elem.dataset.anchorFocused;
        }, 6000);
      }
    });
  }
  
  render() {
    const {number, itemId, linkIds} = this.props;
    const children = buildRef(this.props);
    const multiLinks = linkIds.length > 1;
    if (linkIds.length === 0) {
      return null;
    }
    return <li id={`ref__${itemId}`}>
      {multiLinks ? <><span>^</span> </> : null}
      {linkIds.map((linkId, idx) => [
        <a
         key={idx}
         className={style['cite-back-link']}
         onClick={this.handleClick}
         href={`#${linkId}`}>
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
        {({setReference, getReferences}) => (
          <LoadReferences
           setReference={setReference}
           references={getReferences()}>
            {(refProps, idx) => <RefItem {...refProps} key={idx} />}
          </LoadReferences>
        )}
      </ReferenceContext.Consumer>
    </ol>;
  }

}
