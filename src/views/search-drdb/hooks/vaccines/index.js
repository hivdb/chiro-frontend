import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const VaccinesContext = React.createContext();


VaccinesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function VaccinesProvider({children}) {
  const sql = `
    SELECT
      vaccine_name,
      vaccine_type,
      priority
    FROM vaccines
    ORDER BY priority, vaccine_name
  `;
  const {
    payload: vaccines,
    isPending
  } = useQuery({sql});

  const vaccineLookup = React.useMemo(
    () => isPending || !vaccines ? {} : vaccines.reduce(
      (acc, vacc) => {
        acc[vacc.vaccineName] = vacc;
        return acc;
      },
      {}
    ),
    [isPending, vaccines]
  );

  const contextValue = {
    vaccines,
    vaccineLookup,
    isPending
  };

  return <VaccinesContext.Provider value={contextValue}>
    {children}
  </VaccinesContext.Provider>;
}


function useVaccines() {
  return React.useContext(VaccinesContext);
}


const Vaccines = {
  Provider: VaccinesProvider,
  useMe: useVaccines
};

export default Vaccines;
