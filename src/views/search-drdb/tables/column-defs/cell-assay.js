export default function CellAssay({
  assayName
}) {
  if (assayName === 'vsv pseudovirus') {
    assayName = 'VSV pseudovirus';
  }
  return assayName;
}
