import React from 'react';
import PropTypes from 'prop-types';


const SuscSummaryContext = React.createContext();

export default SuscSummaryContext;


SuscSummaryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function SuscSummaryProvider({children}) {

  const cacheRef = React.useRef({});

  const getPayload = React.useCallback(
    cacheKey => {
      const payload = cacheRef.current[cacheKey] || [];
      const cached = cacheKey in cacheRef.current;
      return [payload, cached];
    },
    []
  );

  const setPayload = React.useCallback(
    (cacheKey, payload) => {
      cacheRef.current[cacheKey] = payload;
    },
    []
  );

  return <SuscSummaryContext.Provider value={{
    getPayload, setPayload
  }}>
    {children}
  </SuscSummaryContext.Provider>;
}
