import {getMutations} from '../isolate-aggs';

export function filterByRefName({
  refName,
  where,
  params,
  mainTableName = 'M'
}) {
  if (refName) {
    where.push(`
      ${mainTableName}.ref_name = $refName
    `);
    params.$refName = refName;
  }
}


function matchIsolateMutation({
  mainTableName = 'M',
  isoTableName = 'ISO'
}) {
  return `
    EXISTS (
      SELECT 1 FROM isolate_mutations ISOM WHERE
        ISOM.iso_name = ${isoTableName}.iso_name AND
        ISOM.gene = ${mainTableName}.gene AND
        (
          ISOM.position = ${mainTableName}.position OR
          (
            ${mainTableName}.amino_acid = 'del' AND
            EXISTS (
              SELECT 1 FROM known_deletion_ranges DR WHERE
                ${mainTableName}.gene = DR.gene AND
                ${mainTableName}.position BETWEEN
                  DR.position_start AND DR.position_end AND
                ISOM.position BETWEEN
                  DR.position_start AND DR.position_end
            )
          )
        ) AND
        ISOM.amino_acid = ${mainTableName}.amino_acid AND
        NOT EXISTS (
          SELECT 1 FROM ignore_mutations IM WHERE
            ${mainTableName}.gene = IM.gene AND
            ${mainTableName}.position = IM.position AND
            ${mainTableName}.amino_acid = IM.amino_acid
        )
    )
  `;
}


export function filterByVarName({
  varName,
  where,
  params,
  mainTableName = 'M'
}) {
  if (varName) {
    where.push(`
      EXISTS (
        SELECT 1 FROM isolates ISO WHERE
          ISO.var_name = $varName AND
          ${matchIsolateMutation({mainTableName, isoTableName: 'ISO'})}
      )
    `);
    params.$varName = varName;
  }
}


export function filterByIsoAggkey({
  isoAggkey,
  where,
  params,
  mainTableName = 'M'
}) {
  if (isoAggkey) {
    const conds = [];
    for (const [
      idx,
      {gene, position: pos, aminoAcid: aa}
    ] of getMutations(isoAggkey).entries()) {
      conds.push(`(
        ${mainTableName}.gene = $gene${idx} AND
        ${mainTableName}.position = $pos${idx} AND
        ${mainTableName}.amino_acid = $aa${idx}
      )`);
      params[`$gene${idx}`] = gene;
      params[`$pos${idx}`] = pos;
      params[`$aa${idx}`] = aa;
    }
    where.push(`EXISTS (
      SELECT 1 FROM isolate_pairs IP
      WHERE
        IP.num_mutations = 1 AND
        IP.iso_name = $isoAggkey
    )`);
    where.push(conds.join(' OR '));
    params.$isoAggkey = isoAggkey;
  }
}


export function filterByGenePos({
  genePos,
  where,
  params,
  mainTableName = 'M'
}) {
  if (genePos) {
    const [gene, pos] = genePos.split(':');
    where.push(`
      ${mainTableName}.gene = $gene AND
      ${mainTableName}.position = $pos
    `);
    params.$gene = gene;
    params.$pos = Number.parseInt(pos);
  }
}


export function filterByAbNames({
  abNames,
  where,
  params,
  mainTableName = 'M'
}) {
  const realAbNames = abNames.filter(n => n !== 'any');
  if (realAbNames && realAbNames.length > 0) {
    const excludeAbQuery = [];
    for (const [idx, abName] of realAbNames.entries()) {
      where.push(`
        EXISTS (
          SELECT 1 FROM rx_antibodies RXMAB
          WHERE
          RXMAB.ref_name = ${mainTableName}.ref_name AND
          RXMAB.rx_name = ${mainTableName}.rx_name AND
          RXMAB.ab_name = $abName${idx}
        )
      `);
      params[`$abName${idx}`] = abName;
      excludeAbQuery.push(`$abName${idx}`);
    }
  }
  else if (abNames.some(n => n === 'any')) {
    where.push(`
      EXISTS (
        SELECT 1 FROM rx_antibodies RXMAB
        WHERE
          RXMAB.ref_name = ${mainTableName}.ref_name AND
          RXMAB.rx_name = ${mainTableName}.rx_name
      )
    `);
  }
}


function matchSbjRx({
  mainTableName = 'M',
  rxTableName
}) {
  return `
    EXISTS (
      SELECT 1 FROM
        subject_treatments SBJRX
      WHERE
        SBJRX.subject_name = ${mainTableName}.subject_name AND
        SBJRX.start_date < ${mainTableName}.appearance_date AND
        SBJRX.ref_name = ${rxTableName}.ref_name AND
        SBJRX.rx_name = ${rxTableName}.rx_name
    )
  `;
}


export function filterBySbjRxAbNames({
  abNames,
  where,
  params,
  mainTableName = 'M'
}) {
  const realAbNames = abNames.filter(n => n !== 'any');
  if (realAbNames && realAbNames.length > 0) {
    const excludeAbQuery = [];
    for (const [idx, abName] of realAbNames.entries()) {
      where.push(`
        EXISTS (
          SELECT 1 FROM
            rx_antibodies RXMAB
          WHERE
            RXMAB.ab_name = $abName${idx} AND
            RXMAB.ref_name = ${mainTableName}.ref_name AND
            ${matchSbjRx({mainTableName, rxTableName: 'RXMAB'})}
        )
      `);
      params[`$abName${idx}`] = abName;
      excludeAbQuery.push(`$abName${idx}`);
    }
  }
  else if (abNames.some(n => n === 'any')) {
    where.push(`
      EXISTS (
        SELECT 1 FROM
          rx_antibodies RXMAB
        WHERE
          RXMAB.ref_name = ${mainTableName}.ref_name AND
          ${matchSbjRx({mainTableName, rxTableName: 'RXMAB'})}
      )
    `);
  }
}


export function filterByInfectedVarName({
  infectedVarName,
  where,
  params,
  rxcpTableName = 'RXCP',
  isoTableName = 'INFISO',
  varTableName = 'INFVAR'
}) {
  if (infectedVarName) {
    where.push(`
      ${rxcpTableName}.rx_name IS NOT NULL AND
      (
        $infVarName = 'any' OR
        (
          $infVarName = 'Wild Type' AND
          ${varTableName}.as_wildtype IS TRUE
        ) OR
        ${isoTableName}.var_name = $infVarName
      )
    `);
    params.$infVarName = infectedVarName;
  }
}


export function filterBySbjRxInfectedVarName({
  infectedVarName,
  where,
  params,
  mainTableName = 'M'
}) {
  if (infectedVarName) {
    where.push(`
      EXISTS (
        SELECT 1 FROM
          rx_conv_plasma RXCP
          LEFT JOIN isolates INFISO ON
            RXCP.infected_iso_name = INFISO.iso_name
          LEFT JOIN variants INFVAR ON
            INFISO.var_name = INFVAR.var_name
        WHERE
          ${matchSbjRx({mainTableName, rxTableName: 'RXCP'})} AND
          RXCP.ref_name = ${mainTableName}.ref_name AND
          (
            $infVarName = 'any' OR
            (
              $infVarName = 'Wild Type' AND
              INFVAR.as_wildtype IS TRUE
            ) OR
            INFISO.var_name = $infVarName
          )
      )
    `);
    params.$infVarName = infectedVarName;
  }
}


export function queryRxType({mainTableName = 'M'} = {}) {
  return `
    CASE
      WHEN EXISTS (
        SELECT 1 FROM rx_conv_plasma RXCP
        WHERE
          RXCP.ref_name = ${mainTableName}.ref_name AND
          RXCP.rx_name = ${mainTableName}.rx_name
      ) THEN 'conv-plasma'
      WHEN EXISTS (
        SELECT 1 FROM rx_vacc_plasma RXVP
        WHERE
          RXVP.ref_name = ${mainTableName}.ref_name AND
          RXVP.rx_name = ${mainTableName}.rx_name
      ) THEN 'vacc-plasma'
      WHEN EXISTS (
        SELECT 1 FROM rx_antibodies RXMAB
        WHERE
          RXMAB.ref_name = ${mainTableName}.ref_name AND
          RXMAB.rx_name = ${mainTableName}.rx_name
      ) THEN 'antibody'
      ELSE 'unclassified'
    END AS rx_type
  `;
}


export function queryAbNames({mainTableName = 'M'} = {}) {
  return `
    (
      SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
      FROM rx_antibodies RXMAB, antibodies MAB
      WHERE
        ${mainTableName}.ref_name = RXMAB.ref_name AND
        ${mainTableName}.rx_name = RXMAB.rx_name AND
        RXMAB.ab_name = MAB.ab_name
      ORDER BY MAB.priority, RXMAB.ab_name
    ) AS ab_names
  `;
}


export function querySbjRxAbNames({mainTableName = 'M'} = {}) {
  return `
    (
      SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
      FROM rx_antibodies RXMAB, antibodies MAB
      WHERE
        ${mainTableName}.ref_name = RXMAB.ref_name AND
        RXMAB.ab_name = MAB.ab_name AND
        ${matchSbjRx({mainTableName, rxTableName: 'RXMAB'})}
      ORDER BY MAB.priority, RXMAB.ab_name
    ) AS ab_names
  `;
}


export function queryVarNames({mainTableName = 'M'} = {}) {
  return `
    (
      SELECT GROUP_CONCAT(var_name, $joinSep) FROM (
        SELECT DISTINCT ISO.var_name FROM isolates ISO WHERE
          ISO.var_name IS NOT NULL AND
          ${matchIsolateMutation({mainTableName, isoTableName: 'ISO'})}
      ) tmp1
    ) AS var_names
  `;
}


export function queryIsoAggkeys({mainTableName = 'M'} = {}) {
  return `
    (
      SELECT GROUP_CONCAT(iso_aggkey, $joinSep) FROM (
        SELECT DISTINCT ISOP.iso_aggkey FROM isolate_pairs ISOP WHERE
          ISOP.num_mutations = 1 AND
          ${matchIsolateMutation({mainTableName, isoTableName: 'ISOP'})}
      ) tmp2
    ) AS iso_aggkeys
  `;
}


export function queryInfectedVarName({varTableName = 'INFVAR'} = {}) {
  return `
    CASE
      WHEN ${varTableName}.as_wildtype IS TRUE THEN 'Wild Type'
      ELSE ${varTableName}.var_name
    END AS infected_var_name
  `;
}


export function querySbjRxInfectedVarNames({mainTableName = 'M'} = {}) {
  return `
    (
      SELECT GROUP_CONCAT(infected_var_name, $joinSep)
      FROM (
        SELECT DISTINCT CASE
          WHEN INFVAR.as_wildtype IS TRUE THEN 'Wild Type'
          WHEN INFISO.var_name IS NULL THEN $na
          ELSE INFVAR.var_name
        END AS infected_var_name
        FROM rx_conv_plasma RXCP
        LEFT JOIN isolates INFISO ON
          RXCP.infected_iso_name = INFISO.iso_name
        LEFT JOIN variants INFVAR ON
          INFISO.var_name = INFVAR.var_name
        WHERE
          ${matchSbjRx({mainTableName, rxTableName: 'RXCP'})} AND
          RXCP.ref_name = ${mainTableName}.ref_name
      ) AS tmp3
    ) AS infected_var_names
  `;
}
