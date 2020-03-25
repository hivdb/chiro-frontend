import React from 'react';

import './header.sass';


export default class MockHeader extends React.Component {

  render() {
    return (
      <>
        <header className="header-bar">
          <nav className="header-container">
            <ul className="nav">
              <li className="nav-item">
                <a href="/">Home</a>
              </li>
              <li className="nav-item">
                <a href="/">Literatures</a>
              </li>
              <li className="nav-item">
                <a href="/search">Experiments</a>
              </li>
            </ul>
          </nav>
        </header>
        <header className="header-global header-logo">
          <nav className="header-container">
            <a className="brand-logo" href="/">Stanford Medicine</a>
            <a className="brand-sitename" href="/">CoV-Rx-DB</a>
          </nav>

        </header>
      </>
    );
  }

}
