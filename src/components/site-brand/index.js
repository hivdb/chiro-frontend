import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'found';
import makeClassNames from 'classnames';

import style from './style.module.scss';


export default class SiteBrand extends React.Component {

  static propTypes = {
    responsive: PropTypes.bool.isRequired,
    size: PropTypes.oneOf(['normal', 'small', 'large']).isRequired,
    hideSubtitle: PropTypes.bool.isRequired,
    className: PropTypes.string
  };

  static defaultProps = {
    responsive: false,
    hideSubtitle: false,
    size: 'normal'
  };

  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: null
    };
  }

  get lastUpdate() {
    if (this.props.hideSubtitle) {
      return null;
    }
    const {lastUpdate} = this.state;
    if (lastUpdate === null) {
      (async () => {
        const resp = await fetch('/lastupdate.txt');
        const dateStr = (await resp.text()).trim();
        this.setState({lastUpdate: new Date(dateStr)});
      })();
    }
    return lastUpdate;
  }

  render() {
    const {lastUpdate} = this;
    const {hideSubtitle, responsive, size, className} = this.props;
    const classNames = makeClassNames(
      style['brand-container'],
      responsive ? style['responsive'] : null,
      hideSubtitle ? style['no-subtitle'] : null,
      style[`size-${size}`],
      className
    );
    return (
      <div className={classNames}>
        <Link className={style['brand-logo']} to="/" />
        <div className={style['brand-sitename']}>
          <Link className={style['brand-sitename-title']} to="/">
            Coronavirus Antiviral & Resistance Database
          </Link>
          {hideSubtitle ? null :
          <div className={style['brand-sitename-subtitle']}>
            <a
             href="https://hivdb.stanford.edu/"
             rel="noopener noreferrer"
             target="_blank">
              A Stanford HIVDB team website.
            </a>
            {lastUpdate === null ? null :
              ` Last updated on ${lastUpdate.toLocaleString('en-US')}.`}
          </div>}
        </div>
      </div>
    );
  }

}
