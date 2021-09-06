import React from 'react';
import {Link} from 'found';
import classNames from 'classnames';

import style from './style.module.scss';

/** Call-to-action button **/
export default function useCTA(ctaProps) {
  const {
    to,
    href,
    onClick,
    className,
    title,
    defaultClassName = 'cta'
  } = ctaProps || {};
  const [ctaElement, hasCTA] = React.useMemo(
    () => {

      let ctaElement;
      let hasCTA = true;
      const ctaClassName = classNames(
        style[defaultClassName],
        className ? `${className}__${defaultClassName}` : null
      );
      if (href) {
        ctaElement = (
          <a
           className={ctaClassName}
           href={href} onClick={onClick}>
            {title}
          </a>
        );
      }
      else if (to) {
        ctaElement = (
          <Link
           className={ctaClassName}
           to={to} onClick={onClick}>
            {title}
          </Link>
        );
      }
      else if (onClick) {
        ctaElement = (
          <button
           className={ctaClassName}
           onClick={onClick}>
            {title}
          </button>
        );
      }
      else {
        hasCTA = false;
        ctaElement = (
          <span className={ctaClassName}>
            {title}
          </span>
        );
      }
      return [ctaElement, hasCTA];
    },
    [className, href, onClick, title, to, defaultClassName]
  );
  return [ctaElement, hasCTA];
}
