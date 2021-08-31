import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const LIST_JOIN_UNIQ = "$#\b#$";

const VariantsContext = React.createContext();


VariantsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function VariantsProvider({children}) {

  const sql = `
    SELECT
      var_name,
      (
        SELECT GROUP_CONCAT(synonym, "${LIST_JOIN_UNIQ}")
        FROM variant_synonyms VS
        WHERE V.var_name=VS.var_name
        ORDER BY LENGTH(synonym)
      ) AS synonyms,
      count AS susc_result_count
    FROM variant_stats V
    WHERE stat_group='susc_results'
    ORDER BY count DESC
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  const variants = React.useMemo(
    () => {
      let variants;
      if (payload) {
        variants = payload.map(
          ({varName, synonyms, suscResultCount}) => ({
            varName,
            synonyms: synonyms ? synonyms.split(LIST_JOIN_UNIQ) : [],
            suscResultCount
          })
        );
      }
      return variants;
    },
    [payload]
  );

  const contextValue = {
    variants,
    isPending
  };

  return <VariantsContext.Provider value={contextValue}>
    {children}
  </VariantsContext.Provider>;

}

function useVariants() {
  return React.useContext(VariantsContext);
}

const Variants = {
  Provider: VariantsProvider,
  useMe: useVariants
};

export default Variants;
