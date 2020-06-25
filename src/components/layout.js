import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';
import {Container} from 'semantic-ui-react';

import Header from './header';
import Footer from './footer';
import GAWrapper from './ga/gawrapper';

import "typeface-poppins";
import "typeface-source-sans-pro";
import globalStyle from '../styles/global.module.scss';


export default class Layout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    children: PropTypes.node
  }

  static defaultProps = {
    children: null
  }

  get currentPathName() {
    return this.props.match.location.pathname;
  }

  render() {
    const {children, router} = this.props;
    return <>
      <Header currentPathName={this.currentPathName} />
      <div className={globalStyle["main-content"]}>
        <Container className="he is dead jim">
          {children}
        </Container>
      </div>
      <Footer />
      <GAWrapper router={router} />
    </>;
  }

}
