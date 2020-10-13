import React from 'react';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';
import Children from 'react-children-utilities';

import style from './style.module.scss';
import ReferenceContext from './reference-context';
import buildRef from './build-ref';


export default class RefLink extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    identifier: PropTypes.string,
    authors: PropTypes.string,
    year: PropTypes.string,
    title: PropTypes.string,
    journal: PropTypes.string,
    medlineId: PropTypes.string,
    url: PropTypes.string,
    children: PropTypes.node
  }

  handleClick = (evt) => {
    evt && evt.preventDefault();
  }

  handleAnchorClick = (evt) => {
    const {href} = evt.currentTarget.attributes;
    const anchor = href.value.slice(1);
    setTimeout(() => {
      const elem = document.getElementById(anchor);
      const parentLi = elem.closest('li');
      if (parentLi) {
        parentLi.scrollIntoViewIfNeeded();
        parentLi.dataset.anchorFocused = true;
        setTimeout(() => {
          delete parentLi.dataset.anchorFocused;
        }, 6000);
      }
    });
  }

  render() {
    let {name, identifier, ...ref} = this.props;
    name = name || identifier;
    if (!name) {
      const {authors, year} = ref;
      if (authors) {
        name = `${authors.split(' ', 2)[0]}${year}`;
      }
      else {
        name = Children.onlyText(ref.children);
      }
    }

    return <ReferenceContext.Consumer>
      {({setReference, getReference}) => {
        const {number, itemId, linkId} = setReference(name, ref);
        return (
          <Popup
           on="click"
           basic wide="very"
           content={() => <>
             <a
              onClick={this.handleAnchorClick}
              href={`#ref__${itemId}`}>
               {number}
             </a>.{' '}
             {buildRef(getReference(name))}
           </>}
           trigger={
             <sup><a className={style['ref-link']}
              onClick={this.handleClick}
              id={linkId} href={`#ref__${itemId}`}>
               [{number}]
             </a></sup>
           } />
        );
      }}
    </ReferenceContext.Consumer>;
  }

}
