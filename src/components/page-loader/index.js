import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader';

import {usePage} from '../../utils/cms';


PageLoader.propTypes = {
  pageName: PropTypes.string.isRequired,
  component: PropTypes.func,
  children: PropTypes.func
};

export default function PageLoader({
  pageName,
  component,
  children,
  ...childProps
}) {
  const [payload, isPending, hasError] = usePage(pageName);

  return <>
    {isPending ? <Loader loaded={false} /> : (
      hasError ? "Page not found." : React.createElement(
        component,
        {pageName, ...payload, ...childProps},
        children
      )
    )}
  </>;
}
