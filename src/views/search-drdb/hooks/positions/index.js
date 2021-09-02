import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

import {comparePositions} from './funcs';

export {comparePositions};

const PositionsContext = React.createContext();

PositionsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function PositionsProvider({children}) {

  const sql = `
    SELECT
      s.position AS pos_key,
      r.gene,
      r.position,
      r.amino_acid AS ref_amino_acid
    FROM susc_summary s, ref_amino_acid r
    WHERE
      aggregate_by = 'position' AND
      s.position = r.gene || ':' || r.position
    ORDER BY r.gene, r.position
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  const contextValue = {
    positions: payload,
    isPending
  };

  return <PositionsContext.Provider value={contextValue}>
    {children}
  </PositionsContext.Provider>;
}


function usePositions() {
  return React.useContext(PositionsContext);
}

const Positions = {
  Provider: PositionsProvider,
  useMe: usePositions
};

export default Positions;
