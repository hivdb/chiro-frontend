import React, {lazy} from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'found';

const SubPage = lazy(() => import('./subpage'));


VariantsRoutes.propTypes = {
  pathPrefix: PropTypes.string.isRequired,
  defaultPath: PropTypes.string.isRequired
};

export default function VariantsRoutes({pathPrefix, defaultPath}) {
  return <Route path={pathPrefix}>
    <Route path=":name/" Component={SubPage} />
    <Redirect to={defaultPath} />
  </Route>;
}
