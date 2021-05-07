import React from 'react';
import {Link} from 'found';


export default function CellReference({refName, displayName}) {
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
