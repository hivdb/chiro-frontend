const POSSIBLE_FUTURE_MAB_NAMES = [
  'entry (monoclonal antibodies)',
  'entry - monoclonal antibodies',
  'entry-monoclonal antibodies',
  'entry monoclonal antibodies',
  'entry (monoclonal antibody)',
  'entry - monoclonal antibody',
  'entry-monoclonal antibody',
  'entry monoclonal antibody',
  'monoclonal antibodies',
  'monoclonal antibody',
  'entry (antibodies)',
  'entry - antibodies',
  'entry-antibodies',
  'entry antibodies',
  'entry (antibody)',
  'entry - antibody',
  'entry-antibody',
  'entry antibody',
  'entry - mabs',
  'entry-mabs',
  'entry mabs',
  'antibodies',
  'antibody',
  'mabs',
  'mab',
  'abs',
  'ab'
];

export default function isTargetMAb(targetName) {
  return POSSIBLE_FUTURE_MAB_NAMES.includes(targetName.toLocaleLowerCase());
}
