import React from 'react';
import {useRouter, Link} from 'found';
import PropTypes from 'prop-types';
import {buildLocationQuery} from '../../hooks/location-params';

import {ColumnDef} from 'icosa/components/simple-table';


CellReference.propTypes = {
  refName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired
};


function CellReference({refName, displayName}) {
  const {match: {location: loc}} = useRouter();
  return (
    <Link to={{
      pathname: loc.pathname,
      query: buildLocationQuery('article', refName, loc.query)
    }}>
      {displayName}
    </Link>
  );
}


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
