import React, {lazy} from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'found';

const GeneDRMs = lazy(() => import('./gene-drms'));


DRMsRoutes.propTypes = {
  pathPrefix: PropTypes.string.isRequired,
  defaultPath: PropTypes.string.isRequired
};

export default function DRMsRoutes({pathPrefix, defaultPath}) {
  return <Route path={pathPrefix}>
    <Route path=":name/" Component={GeneDRMs} />
    <Redirect to={defaultPath} />
  </Route>;
}
