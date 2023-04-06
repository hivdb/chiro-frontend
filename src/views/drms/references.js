import React from 'react';
import PropTypes from 'prop-types';
import refDataLoader from '../../components/refdata-loader';
import Markdown from 'icosa/components/markdown';


References.propTypes = {
  refNames: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};


export default function References({refNames}) {

  const mdText = React.useMemo(
    () => {
      const mdArray = [];
      for (let idx = 0; idx < refNames.length; idx ++) {
        const refName = refNames[idx];
        mdArray.push(
          `${idx + 1}. <a name="fn-${refName}" /> ` +
          `**${refName}**: [^${refName}#inline]`
        );
      }
      return mdArray.join('\n');
    },
    [refNames]
  );

  return (
    <Markdown
     escapeHtml={false}
     disableHeadingTagAnchor
     imagePrefix=""
     refDataLoader={refDataLoader}>
      ## References{'\n\n'}
      {mdText}
    </Markdown>
  );
}
