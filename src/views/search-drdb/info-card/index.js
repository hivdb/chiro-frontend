import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {TiDelete} from '@react-icons/all-files/ti/TiDelete';


import style from './style.module.scss';


export function normTitle(text) {
  if (text) {
    return text.trim().replace(/\.$/, '');
  }
  return text;
}


InfoCard.propTypes = {
  loaded: PropTypes.bool.isRequired,
  tagline: PropTypes.node,
  title: PropTypes.string,
  removeTo: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.string.isRequired
  ]),
  className: PropTypes.string,
  children: PropTypes.node
};


export default function InfoCard({
  loaded,
  tagline,
  title,
  removeTo,
  className,
  children
}) {

  return (
    <section
     data-loaded={loaded}
     className={classNames(
       style['info-card'],
       className
     )}>
      {removeTo ?
        <div className={classNames(
          style['action'],
          className ? `${className}__action` : null
        )}>
          <Link
           className={classNames(
             style['remove'],
             className ? `${className}__remove` : null
           )}
           to={removeTo}>
            <TiDelete/>
          </Link>
        </div> : null}
      {tagline ?
        <div className={classNames(
          style['tagline'],
          className ? `${className}__tagline` : null
        )}>
          {tagline}
        </div> : null}
      <h1 className={classNames(
        style['title'],
        className ? `${className}__title` : null
      )}>{normTitle(title)}</h1>
      {children}
    </section>
  );
}
