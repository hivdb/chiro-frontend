import React from 'react';
import PageLoader from '../../components/page-loader';
import Markdown from '../../components/markdown';


function MAbSummaryTable({
  displayMAbs,
  tables: {MAbs},
  imagePrefix,
  cmsPrefix,
  curCompound,
  children
}) {
  const tableName = `MAb-${displayMAbs.join(';')}`;
  let {data, columnDefs, ...MAbProps} = MAbs;
  // remove "MAb (EC50)" column
  columnDefs = columnDefs.filter(
    ({name}) => (
      name !== 'antibodies' &&
      name !== 'dataAvailability.animal'
    )
  );
  data = data.filter(
    ({antibodies}) => antibodies.some(
      ({name}) => displayMAbs.includes(name)
    )
  );
  if (data.length >= 2 || data.length === 0) {
    // fallback to display children
    return children;
  }
  const tables = {};
  tables[tableName] = {...MAbProps, data, columnDefs};
  let mAbsInTitle = '';
  if (displayMAbs.length > 1) {
    if (data.length === 1) {
      mAbsInTitle += 'Group of ';
    }
    else {
      mAbsInTitle += 'Groups of ';
    }
  }

  if (curCompound) {
    mAbsInTitle += curCompound.name;
  }
  else {
    mAbsInTitle += displayMAbs[0];
  }

  return <>
    <Markdown
     imagePrefix={imagePrefix}
     cmsPrefix={cmsPrefix}
     tables={tables}>
      ## [MAbs tracker](/page/mab-tables/):{' '}{mAbsInTitle}{'\n\n'}

      [table]{'\n'}
      {tableName}{'\n'}
      [/table]{'\n'}
    </Markdown>
  </>;
}


export default function MAbSummaryTableContainer({
  displayMAbs, curCompound, children}) {

  return (
    <PageLoader
     pageName="mab-tables"
     childProps={{children, curCompound, displayMAbs}}
     component={MAbSummaryTable} />
  );

}


MAbSummaryTableContainer.defaultProps = {children: null};
