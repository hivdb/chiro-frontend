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
      V.var_name,
      (
        SELECT GROUP_CONCAT(synonym, "${LIST_JOIN_UNIQ}")
        FROM variant_synonyms VS
        WHERE V.var_name=VS.var_name
        ORDER BY LENGTH(synonym)
      ) AS synonyms,
      as_wildtype
    FROM variants V JOIN susc_summary SS ON
      SS.aggregate_by = 'variant' AND
      V.var_name = SS.var_name
    ORDER BY SS.num_experiments DESC
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
          ({varName, asWildtype, synonyms}) => ({
            varName,
            synonyms: synonyms ? synonyms.split(LIST_JOIN_UNIQ) : [],
            asWildtype
          })
        );
      }
      return variants;
    },
    [payload]
  );
  const variantLookup = React.useMemo(
    () => variants && variants.reduce(
      (acc, variant) => {
        acc[variant.varName] = variant;
        return acc;
      },
      {}
    ),
    [variants]
  );

  const contextValue = {
    variants,
    variantLookup,
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
