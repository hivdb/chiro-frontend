import React from 'react';
import {Header, Button} from 'semantic-ui-react';

import setTitle from '../utils/set-title';


export default class Donation extends React.Component {

  render() {
    setTitle('Donation');

    return <article>
      <Header as="h1" dividing>Support and Donation</Header>
      <section>
        <p>
          We are grateful to you for any amount of donation for supporting the
          Stanford Coronavirus Antiviral & Resistance Database (CoVDB).
          To make a donation, please click the “Donate to CoVDB” button. In the
          Stanford Make a Gift page, type in “
          <strong>COVID-19 Research Database-Dr. Shafer</strong>
          ” in the Special instructions field, and
          complete the form.
        </p>
        <p>
          <Button
           content="Donate to CoVDB"
           as="a" target="_blank"
           href="https://makeagift.stanford.edu/get/page/makeagift?stp=13" />
        </p>
      </section>
    </article>;

  }

}
