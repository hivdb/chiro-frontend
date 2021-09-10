import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const LIST_JOIN_UNIQ = "$#\b#$";

const InfectedVariantsContext = React.createContext();


InfectedVariantsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function InfectedVariantsProvider({children}) {

  const sql = `
    SELECT
      infected_var_name AS var_name,
      (
        SELECT GROUP_CONCAT(synonym, "${LIST_JOIN_UNIQ}")
        FROM variant_synonyms VS
        WHERE V.var_name=VS.var_name
        ORDER BY LENGTH(synonym)
      ) AS synonyms
    FROM (
      SELECT DISTINCT infected_var_name FROM susc_summary
      WHERE
        aggregate_by = 'infected_variant' AND
        infected_var_name IS NOT NULL
    ) S
    LEFT JOIN variants V ON
      S.infected_var_name = V.var_name
    ORDER BY CASE
      WHEN infected_var_name = 'Wild Type' THEN '_WT'
      ELSE infected_var_name
    END
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  let infectedVariants;
  if (payload) {
    infectedVariants = payload.map(
      ({varName, synonyms}) => ({
        varName,
        synonyms: synonyms ? synonyms.split(LIST_JOIN_UNIQ) : []
      })
    );
  }

  const contextValue = {
    infectedVariants,
    isPending
  };

  return <InfectedVariantsContext.Provider value={contextValue}>
    {children}
  </InfectedVariantsContext.Provider>;

}

function useInfectedVariants() {
  return React.useContext(InfectedVariantsContext);
}

const InfectedVariants = {
  Provider: InfectedVariantsProvider,
  useMe: useInfectedVariants
};

export default InfectedVariants;
