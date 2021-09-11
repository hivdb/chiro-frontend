import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';

import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';


function CellReference({refName, displayName}) {
  return (
    <Link to={{
      pathname: '/search-drdb/',
      query: {
        'article': refName
      }
    }}>
      {displayName}
    </Link>
  );
}


CellReference.propTypes = {
  refName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired
};


export default function useRefName({labels, articleLookup, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('refName')) {
        return null;
      }
      return new ColumnDef({
        name: 'refName',
        label: labels.refName || 'Reference',
        render: refName => (
          <CellReference
           refName={refName}
           displayName={articleLookup[refName]?.displayName} />
        ),
        exportCell: refName => ({
          '': refName,
          DOI: articleLookup[refName]?.doi || articleLookup[refName]?.url
        })
      });
    },
    [articleLookup, columns, labels.refName, skip]
  );
}
