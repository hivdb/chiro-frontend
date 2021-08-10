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
    keyProps => {
      const keyString = JSON.stringify(keyProps);
      const payload = cacheRef.current[keyString] || [];
      const cached = keyString in cacheRef.current;
      return [payload, cached];
    },
    []
  );

  const setPayload = React.useCallback(
    (keyProps, payload) => {
      const keyString = JSON.stringify(keyProps);
      cacheRef.current[keyString] = payload;
    },
    []
  );

  return <SuscSummaryContext.Provider value={{
    getPayload, setPayload
  }}>
    {children}
  </SuscSummaryContext.Provider>;
}
