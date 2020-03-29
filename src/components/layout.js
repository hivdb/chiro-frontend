import React from 'react';
import PropTypes from 'prop-types';
import {Container} from 'semantic-ui-react';

import Header from './header';
import GAWrapper from './ga/gawrapper';

import "source-sans-pro/source-sans-pro.css";
import globalStyle from '../styles/global.module.scss';


export default class Layout extends React.Component {

  static propTypes = {
    children: PropTypes.node
  }

  static defaultProps = {
    children: null
  }

  render() {
    const {children, router} = this.props;
    return <>
      <Header />
      <div className={globalStyle["main-content"]}>
        <Container className="he is dead jim">
          {children}
        </Container>
      </div>
      <GAWrapper router={router} />
    </>;
  }

}
