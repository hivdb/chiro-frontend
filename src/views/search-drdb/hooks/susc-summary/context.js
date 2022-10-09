import React from 'react';
import PropTypes from 'prop-types';


const SuscSummaryContext = React.createContext();

export default SuscSummaryContext;


SuscSummaryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function SuscSummaryProvider({children}) {

  const [cache, setCache] = React.useState({});

  const getPayload = React.useCallback(
    cacheKey => {
      const payload = cache[cacheKey] || [];
      const cached = cacheKey in cache;
      return [payload, cached];
    },
    [cache]
  );

  const setPayload = React.useCallback(
    (cacheKey, payload) => {
      cache[cacheKey] = payload;
      setCache(cache);
    },
    [cache]
  );

  return <SuscSummaryContext.Provider value={{
    getPayload, setPayload
  }}>
    {children}
  </SuscSummaryContext.Provider>;
}
