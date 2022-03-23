import React from 'react';

import IndivSubjectTable from './indiv-subjects';
import AggSubjectTable from './agg-subjects';
import AnimalSubjectTable from './animal-subjects';


export default function InVivoMutationsTable() {

  return <section>
    <IndivSubjectTable />
    <AggSubjectTable />
    <AnimalSubjectTable />
  </section>;

}
