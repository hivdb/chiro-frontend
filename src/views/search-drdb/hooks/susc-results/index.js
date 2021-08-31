import React from 'react';
import PropTypes from 'prop-types';

import useAb, {AbSuscResultsProvider} from './use-ab';
import useCP, {CPSuscResultsProvider} from './use-cp';
import useVP, {VPSuscResultsProvider} from './use-vp';


SuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function SuscResultsProvider({children}) {
  return (
    <AbSuscResultsProvider>
      <CPSuscResultsProvider>
        <VPSuscResultsProvider>
          {children}
        </VPSuscResultsProvider>
      </CPSuscResultsProvider>
    </AbSuscResultsProvider>
  );
}

const SuscResults = {
  useAb,
  useCP,
  useVP,
  Provider: SuscResultsProvider
};


export default SuscResults;
