import React from 'react';
import {Link} from 'found';


export default function CellReference({refName}) {
  return (
    <Link to={{
      pathname: '/search-drdb/',
      query: {
        'article': refName
      }
    }}>
      {refName}
    </Link>
  );
}
