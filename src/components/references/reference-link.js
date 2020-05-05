import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import ReferenceContext from './reference-context';


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

  render() {
    let {name, identifier, ...ref} = this.props;
    name = name || identifier;
    if (!name) {
      const {authors, year} = ref;
      name = `${authors.split(' ', 2)[0]}${year}`;
    }

    return <ReferenceContext.Consumer>
      {({setReference}) => {
        const {number, itemId, linkId} = setReference(name, ref);
        return <sup>
          <a className={style['ref-link']} id={linkId} href={`#${itemId}`}>
            [{number}]
          </a>
        </sup>;
      }}
    </ReferenceContext.Consumer>;
  }

}
