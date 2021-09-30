import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const LIST_JOIN_UNIQ = "$#\b#$";

const VariantsContext = React.createContext();


VariantsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function useOne(varName) {
  const {variantLookup, isPending} = React.useContext(VariantsContext);
  const variant = (variantLookup || {})[varName];
  const sqlStatus = `
    SELECT ref_name, status FROM variant_status
    WHERE var_name = $varName
    ORDER BY ref_name
  `;
  const {
    payload: status,
    isPending: isStatusPending
  } = useQuery({sql: sqlStatus, params: {$varName: varName}});

  const sqlCons = `
    SELECT
    C.gene,
    R.amino_acid ref_amino_acid,
    C.position,
    C.amino_acid
    FROM variant_consensus C, ref_amino_acid R
    WHERE
      C.var_name = $varName AND
      C.gene = R.gene AND
      C.position = R.position
    ORDER BY C.gene, C.position, C.amino_acid
  `;
  const {
    payload: consensus,
    isPending: isConsPending
  } = useQuery({sql: sqlCons, params: {$varName: varName}});

  return React.useMemo(
    () => ({
      variant: variant ? {
        ...variant,
        status,
        consensus
      } : undefined,
      isPending: isPending || isStatusPending || isConsPending
    }),
    [consensus, isConsPending, isPending, isStatusPending, status, variant]
  );
}


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
      as_wildtype,
      consensus_availability
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
            asWildtype: !!asWildtype
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
  useMe: useVariants,
  useOne
};

export default Variants;
