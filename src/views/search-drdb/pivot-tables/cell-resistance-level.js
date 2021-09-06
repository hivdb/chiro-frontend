export default function CellRLevel({rLevel}) {
  switch (rLevel) {
    case 'susceptible':
      return 'Susceptible';
    case 'partial-resistance':
      return 'Partial resistance';
    case 'resistant':
      return 'Resistant';
    default:
      return 'Undetermined';
  }
}
