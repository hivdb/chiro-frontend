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
      m.gene || ':' || m.position AS pos_key,
      m.gene,
      m.position,
      r.amino_acid AS ref_amino_acid
    FROM isolate_mutations m, ref_amino_acid r
    WHERE
      m.gene = r.gene AND
      m.position = r.position
    GROUP BY m.gene, m.position, r.amino_acid
    ORDER BY m.gene, m.position
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
