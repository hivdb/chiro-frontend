import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'found';
import makeClassNames from 'classnames';

import style from './style.module.scss';


SiteBrand.propTypes = {
  responsive: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['normal', 'small', 'large']).isRequired,
  hideSubtitle: PropTypes.bool.isRequired,
  className: PropTypes.string
};

SiteBrand.defaultProps = {
  responsive: false,
  hideSubtitle: false,
  size: 'normal'
};

export default function SiteBrand({responsive, size, hideSubtitle, className}) {

  const [lastUpdate, setLastUpdate] = React.useState(null);

  React.useEffect(
    () => {
      if (hideSubtitle) {
        return;
      }
      else {
        let mounted = true;
        fetch('/lastupdate.txt')
          .then(async resp => {
            const dateStr = (await resp.text()).trim();
            mounted && setLastUpdate(new Date(dateStr));
          });
        return () => mounted = false;
      }
    },
    [hideSubtitle]
  );

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
