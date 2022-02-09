const AGG_OPTIONS = [
  'rx_type',
  'article',
  'infected_variant',
  'vaccine',
  'antibody',
  'antibody:any',
  'antibody:indiv',
  'variant',
  'isolate_agg',
  'isolate',
  'position',
  'vaccine_dosage',
  'potency_type',
  'potency_unit'
];

const AGG_OPTION_BY_VALUE_NAME = {
  rxType: ['rx_type'],
  refName: ['article'],
  antibodyNames: ['antibody', 'antibody:indiv', 'antibody:any'],
  vaccineName: ['vaccine'],
  infectedVarName: ['infected_variant'],
  controlIsoName: ['control_isolate'],
  controlVarName: ['control_variant'],
  isoName: ['isolate'],
  position: ['position'],
  varName: ['variant'],
  isoAggkey: ['isolate_agg']
};

const ORDER_BY_VALUE_NAME = {
  antibodyNames: ['CAST(antibody_order AS INTEGER)'],
  vaccineName: ['CAST(vaccine_order AS INTEGER)']
};

const DEFAULT_SELECT_COLUMNS = [
  'aggregate_by',
  'rx_type',
  'iso_type',
  'ref_name',
  'antibody_names',
  'antibody_order',
  'vaccine_name',
  'vaccine_order',
  'vaccine_dosage',
  'infected_var_name',
  'control_iso_name',
  'control_iso_display',
  'control_var_name',
  'iso_name',
  'iso_aggkey',
  'iso_agg_display',
  'position',
  'potency_type',
  'potency_unit',
  'num_subjects',
  'num_samples',
  'num_experiments'
];

export {
  AGG_OPTIONS,
  AGG_OPTION_BY_VALUE_NAME,
  ORDER_BY_VALUE_NAME,
  DEFAULT_SELECT_COLUMNS
};
