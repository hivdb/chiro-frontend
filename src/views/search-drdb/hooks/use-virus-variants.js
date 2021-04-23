import React from 'react';
import useQuery from './use-query';


function countSpikeMutations(mutations) {
  // count variant (spike) mutations with a few exceptions
  let spikeMuts = mutations.filter(({gene}) => gene === 'S');
  let numMuts = spikeMuts.length;
  
  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos === 614 && aminoAcid === 'G'
  ));
  // const hasD614G = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    (pos === 69 || pos === 70) && aminoAcid === 'del'
  ));
  const hasRangeDel69 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos >= 141 && pos <= 146 && aminoAcid === 'del'
  ));
  const hasRangeDel141 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  spikeMuts = spikeMuts.filter(({position: pos, aminoAcid}) => !(
    pos >= 242 && pos <= 244 && aminoAcid === 'del'
  ));
  const hasRangeDel242 = numMuts > spikeMuts.length;
  numMuts = spikeMuts.length;

  return numMuts + hasRangeDel69 + hasRangeDel141 + hasRangeDel242;
}


const ORDERD_VARIANT_TYPE = [
  'individual-mutation',
  'named-variant',
  'mutation-combination'
];


function classifyVariant({displayName, mutations}) {
  if (displayName) {
    return 'named-variant';
  }

  const numMuts = countSpikeMutations(mutations);

  if (numMuts > 1) {
    return 'mutation-combination';
  }
  else {
    return 'individual-mutation';
  }
}


function useJoinMutations({
  variantLookup,
  skip = false
}) {
  const sql = React.useMemo(
    () => {
      let sql;
      if (!skip && variantLookup) {
        for (const variant of Object.values(variantLookup)) {
          variant.mutations = [];
        }
        sql = `
          SELECT
            variant_name,
            V.gene,
            V.position,
            V.amino_acid,
            R.amino_acid AS ref_amino_acid
          FROM variant_mutations V, ref_amino_acid R
          WHERE
            V.gene = R.gene AND
            V.position = R.position
          ORDER BY V.gene, V.position, V.amino_acid
        `;
      }
      return sql;
    },
    [skip, variantLookup]
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
        for (const {variantName, ...mut} of mutations) {
          const variant = variantLookup[variantName];
          variant.mutations.push(mut);
        }
      }
      return {isPending};
    },
    [skip, isPending, mutations, variantLookup]
  );
}


export function compareVariants(variantA, variantB) {
  if (variantA.variantName === variantB.variantName) {
    // short-cut if the variant names are the same
    return 0;
  }
  const typeA = ORDERD_VARIANT_TYPE.indexOf(variantA.type);
  const typeB = ORDERD_VARIANT_TYPE.indexOf(variantB.type);

  // 1. sort by type
  let cmp = typeA - typeB;
  if (cmp) { return cmp; }

  for (const [idx, mutA] of variantA.mutations.entries()) {
    const mutB = variantB.mutations[idx];
    if (!mutB) {
      // shorter first, variantA is longer than variantB
      return 1;
    }
    // 2. sort by position
    cmp = mutA.position - mutB.position;
    if (cmp) { return cmp; }

    // 3. sort by AA
    cmp = mutA.aminoAcid.localeCompare(mutB.aminoAcid);
    if (cmp) { return cmp; }
  }
  // shorter first, variant A is shorter than variantB
  cmp = variantA.mutations.length - variantB.mutations.length;
  if (cmp) { return cmp; }

  // last, compare the variant name
  return variantA.variantName.localeCompare(variantB.variantName);
}


export default function useVirusVariant({
  skip = false
} = {}) {

  const sql = `
    SELECT variant_name, display_name, expandable
    FROM virus_variants
  `;

  const {
    payload: variants,
    isPending
  } = useQuery({sql, skip});

  const variantLookup = React.useMemo(
    () => skip || isPending || !variants ? {} : variants.reduce(
      (acc, v) => {
        acc[v.variantName] = v;
        return acc;
      },
      {}
    ),
    [skip, isPending, variants]
  );

  const {isPending: isMutationPending} = useJoinMutations({
    variantLookup,
    skip: skip || isPending
  });

  if (!skip && !isPending && !isMutationPending) {
    for (const variant of variants) {
      variant.type = classifyVariant(variant);
    }
    // variants.sort(compareVariants);
  }

  return {
    variants,
    variantLookup,
    isPending: isPending || isMutationPending
  };
}
