import React from 'react';
import ReferenceContext, {ReferenceContextValue} from './reference-context';
import RefLink from './reference-link';
import RefDefinition from './reference-definition';
import buildRef from './build-ref';
import style from './style.module.scss';

export {ReferenceContext, ReferenceContextValue, RefLink, RefDefinition};


class RefItem extends React.Component {
  
  render() {
    const {number, itemId, linkIds} = this.props;
    const children = buildRef(this.props);
    const multiLinks = linkIds.length > 1;
    if (linkIds.length === 0) {
      return null;
    }
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
