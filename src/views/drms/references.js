import React from 'react';
import PropTypes from 'prop-types';
import refDataLoader from '../../components/refdata-loader';
import Markdown from 'icosa/components/markdown';
import {useQuery} from 'icosa/utils/sqlite3';


References.propTypes = {
  gene: PropTypes.string.isRequired,
  drdbVersion: PropTypes.string.isRequired
};

export default function References({
  gene,
  drdbVersion
}) {
  const {
    payload,
    isPending
  } = useQuery({
    sql: `
      SELECT ref_name FROM resistance_mutation_articles
      WHERE gene = $gene
      ORDER BY ref_name
    `,
    params: {$gene: gene},
    dbVersion: drdbVersion,
    dbName: 'covid-drdb'
  });

  const mdText = React.useMemo(
    () => {
      if (isPending) {
        return '';
      }
      const mdArray = [];
      for (let idx = 0; idx < payload.length; idx ++) {
        const {refName} = payload[idx];
        mdArray.push(
          `${idx + 1}. **${refName}**: [^${refName}#inline]`
        );
      }
      return mdArray.join('\n');
    },
    [payload, isPending]
  );

  return (
    <Markdown
     disableHeadingTagAnchor
     imagePrefix=""
     refDataLoader={refDataLoader}>
      ## References{'\n\n'}
      {mdText}
    </Markdown>
  );
}
