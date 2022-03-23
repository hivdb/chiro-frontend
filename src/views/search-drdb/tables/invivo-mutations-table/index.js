import React from 'react';
import {H3} from 'sierra-frontend/dist/components/heading-tags';

import IndivSubjectTable from './indiv-subjects';
import AggSubjectTable from './agg-subjects';
import AnimalSubjectTable from './animal-subjects';


export default function InVivoMutationsTable() {

  return <section>
    <IndivSubjectTable />
    <section>
      <H3>Results in aggregated form</H3>
      <AggSubjectTable />
    </section>
    <section>
      <H3>Animal models</H3>
      <AnimalSubjectTable />
    </section>
  </section>;

}
