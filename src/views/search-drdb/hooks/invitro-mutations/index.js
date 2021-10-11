import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';
import LocationParams from '../location-params';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const InVitroMutationsContext = React.createContext();


function parseIsoAggkey(isoAggkey) {
  let prevGene;
  const muts = [];
  for (const mut of isoAggkey.split('+')) {
    let [gene, geneMut] = mut.split(':');
    if (!geneMut) {
      geneMut = gene;
      gene = prevGene;
    }
    else {
      prevGene = gene;
    }
    let posStart, posEnd, aa;
    if (geneMut.endsWith('del')) {
      [posStart, posEnd] = geneMut.slice(0, geneMut.length - 3).split('-');
      if (!posEnd) {
        posEnd = posStart;
      }
      aa = 'del';
    }
    else if (geneMut.endsWith('ins')) {
      posStart = posEnd = geneMut.slice(0, geneMut.length - 3);
      aa = 'ins';
    }
    else if (geneMut.endsWith('stop')) {
      posStart = posEnd = geneMut.slice(0, geneMut.length - 4);
      aa = 'stop';
    }
    else {
      posStart = posEnd = geneMut.slice(0, geneMut.length - 1);
      aa = geneMut[geneMut.length - 1];
    }
    posStart = Number.parseInt(posStart);
    posEnd = Number.parseInt(posEnd);
    for (let pos = posStart; pos <= posEnd; pos ++) {
      muts.push([gene, pos, aa]);
    }
  }
  return muts;
}


function usePrepareQuery({refName, abNames, isoAggkey, genePos, skip}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {$joinSep: LIST_JOIN_MAGIC_SEP};
      const where = [];
      const realAbNames = abNames.filter(n => n !== 'any');

      if (refName) {
        where.push(`
          M.ref_name = $refName
        `);
        params.$refName = refName;
      }
      if (isoAggkey) {
        const conds = [];
        for (const [
          idx,
          [gene, pos, aa]
        ] of parseIsoAggkey(isoAggkey).entries()) {
          conds.push(`(
            M.gene = $gene${idx} AND
            M.position = $pos${idx} AND
            M.amino_acid = $aa${idx}
          )`);
          params[`$gene${idx}`] = gene;
          params[`$pos${idx}`] = pos;
          params[`$aa${idx}`] = aa;
        }
        where.push(conds.join(' OR '));
      }
      else if (genePos) {
        const [gene, pos] = genePos.split(':');
        where.push(`M.gene = $gene AND M.position = $pos`);
        params.$gene = gene;
        params.$pos = Number.parseInt(pos);
      }
      let rxAbFiltered = false;
      if (realAbNames && realAbNames.length > 0) {
        rxAbFiltered = true;
        const excludeAbQuery = [];
        for (const [idx, abName] of realAbNames.entries()) {
          where.push(`
            EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name AND
              RXMAB.ab_name = $abName${idx}
            )
          `);
          params[`$abName${idx}`] = abName;
          excludeAbQuery.push(`$abName${idx}`);
        }
      }
      if (!rxAbFiltered) {
        where.push(`
          EXISTS (
            SELECT 1 FROM rx_antibodies RXMAB
            WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name
          )
        `);
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          ref_name || rx_name || gene || position || amino_acid AS uniq_key,
          ref_name,
          rx_name,
          (
            SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
            FROM rx_antibodies RXMAB, antibodies MAB
            WHERE
              M.ref_name = RXMAB.ref_name AND
              M.rx_name = RXMAB.rx_name AND
              RXMAB.ab_name = MAB.ab_name
            ORDER BY MAB.priority, RXMAB.ab_name
          ) AS ab_names,
          gene,
          position,
          amino_acid,
          section,
          date_added
        FROM invitro_selection_results M
        WHERE
          (${where.join(') AND (')})
      `;
      return {
        sql,
        params
      };
    },
    [abNames, genePos, isoAggkey, refName, skip]
  );
}

InVitroMutationsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function InVitroMutationsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine || filterFlag.infectedVariant;
  const {
    sql,
    params
  } = usePrepareQuery({abNames, refName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const inVitroMuts = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        mut => {
          mut.abNames = mut.abNames.split(LIST_JOIN_MAGIC_SEP);
          return mut;
        }
      );
    },
    [isPending, payload, skip]
  );
  const contextValue = {
    inVitroMuts,
    isPending: skip || isPending
  };

  return <InVitroMutationsContext.Provider value={contextValue}>
    {children}
  </InVitroMutationsContext.Provider>;
}

function useInVitroMutations() {
  return React.useContext(InVitroMutationsContext);
}

const InVitroMutations = {
  Provider: InVitroMutationsProvider,
  useMe: useInVitroMutations
};

export default InVitroMutations;
