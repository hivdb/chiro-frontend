import React, {Suspense} from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape} from 'found';
import {Container} from 'semantic-ui-react';

import Header from './header';
import Footer from './footer';
import Loader from 'react-loader';
import GAWrapper from './ga/gawrapper';

import "typeface-poppins";
import "typeface-source-sans-pro";
import globalStyle from '../styles/global.module.scss';


Layout.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  children: PropTypes.node
};

Layout.defaultProps = {
  children: null
};


export default function Layout({match, router, children}) {
  const currentPathName = match.location.pathname;
  const locationRef = React.useRef(match.location);
  locationRef.current = match.location;

  React.useEffect(
    () => {
      if (!currentPathName.endsWith('/')) {
        router.replace({
          ...locationRef.current,
          pathname: currentPathName + '/'
        });
      }
    },
    [router, currentPathName]
  );

  return <Suspense fallback={<Loader loaded={false} />}>
    <Header currentPathName={currentPathName} />
    <div className={globalStyle["main-content"]}>
      <Container className="he is dead jim">
        {children}
      </Container>
    </div>
    <Footer />
    <GAWrapper router={router} />
  </Suspense>;
}
