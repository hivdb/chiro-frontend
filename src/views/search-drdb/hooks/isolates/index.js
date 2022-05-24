import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import Variants from '../variants';

import {
  countSpikeMutations,
  classifyIsolate,
  compareIsolates,
  compareMutations
} from './funcs';

export {compareIsolates, compareMutations};

const IsolatesContext = React.createContext();


function useJoinMutations({
  isolateLookup,
  skip = false
}) {
  const sql = React.useMemo(
    () => {
      let sql;
      if (!skip && isolateLookup) {
        for (const isolate of Object.values(isolateLookup)) {
          isolate.mutations = [];
        }
        sql = `
          SELECT
            iso_name,
            V.gene,
            V.position,
            V.amino_acid,
            R.amino_acid AS ref_amino_acid
          FROM isolate_mutations V
            LEFT JOIN ref_amino_acid R ON
              V.gene = R.gene AND
              V.position = R.position
          ORDER BY V.gene, V.position, V.amino_acid
        `;
      }
      return sql;
    },
    [skip, isolateLookup]
  );
  const {
    payload: mutations,
    isPending
  } = useQuery({
    sql,
    skip
  });

  return React.useMemo(
    () => {
      if (!skip && !isPending) {
        for (const {isoName, ...mut} of mutations) {
          const isolate = isolateLookup[isoName];
          isolate.mutations.push(mut);
        }
      }
      return {isPending};
    },
    [skip, isPending, mutations, isolateLookup]
  );
}


IsolatesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function IsolatesProvider({children}) {

  const sql = `
    SELECT
      I.iso_name,
      var_name,
      expandable,
      gisaid_id,
      genbank_accn
    FROM isolates I
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  const {
    variants,
    isPending: isVarsPending
  } = Variants.useMe();

  const isolates = React.useMemo(
    () => {
      if (isPending || isVarsPending) {
        return null;
      }
      const varLookup = variants.reduce(
        (acc, v) => {
          acc[v.varName] = v;
          return acc;
        },
        {}
      );
      return payload.map(
        iso => ({
          ...iso,
          synonyms: (
            iso.varName in varLookup ?
              varLookup[iso.varName].synonyms : []
          )
        })
      );
    },
    [isPending, isVarsPending, payload, variants]
  );

  const isolateLookup = React.useMemo(
    () => isPending || !isolates ? {} : isolates.reduce(
      (acc, iso) => {
        acc[iso.isoName] = iso;
        return acc;
      },
      {}
    ),
    [isPending, isolates]
  );

  const {isPending: isMutationPending} = useJoinMutations({
    isolateLookup,
    skip: isPending
  });

  if (!isPending && !isMutationPending) {
    for (const isolate of isolates) {
      const numMuts = countSpikeMutations(isolate.mutations);
      isolate.numMuts = numMuts;
      isolate.type = classifyIsolate(isolate);
    }
    // isolates.sort(compareisolates);
  }

  const contextValue = {
    isolates,
    isolateLookup,
    isPending: isPending || isMutationPending
  };

  return <IsolatesContext.Provider value={contextValue}>
    {children}
  </IsolatesContext.Provider>;
}

function useIsolates() {
  return React.useContext(IsolatesContext);
}

const Isolates = {
  Provider: IsolatesProvider,
  useMe: useIsolates
};

export default Isolates;
