export default function getTargetShowName(name) {
  if (name === '3CL Protease') {
    name = 'Protease - 3CL';
  }
  if (name === 'PL Protease') {
    name = 'Protease - PL';
  }
  if (name === 'HIV PIs') {
    name = 'Protease - HIV PIs';
  }
  if (name === 'Entry - Receptor binding') {
    name = 'Entry - Miscellaneous';
  }
  if (name === 'Host Endosomal Trafficking') {
    name = 'Host - Endosomal trafficking';
  }
  if (name === 'Host Cyclophilin Inhibition') {
    name = 'Host - Cyclophilin inhibition';
  }
  if (name === 'Host') {
    name = 'Host - Miscellaneous';
  }
  return name;
}