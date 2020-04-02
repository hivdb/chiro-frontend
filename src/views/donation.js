import React from 'react';
import {Header, Button} from 'semantic-ui-react';


export default class Donation extends React.Component {

  render() {

    return <article>
      <Header as="h1" dividing>Support and Donation</Header>
      <section>
        <p>
          We are grateful to you for any amount of donation for supporting the
          {' '}<strong>
            Stanford Coronavirus Antiviral Research Database
          </strong>.
          To make a donation, please click the “Donate to CoVDB” button. In the
          Stanford Make a Gift page, type in “COVID-19 Research Database-Dr.
          Shafer” in the Special instructions field, and complete the form.
        </p>
        <p>
          <Button
           color="red" icon="heart"
           content="Donate to CoVDB"
           as="a" target="_blank"
           href="https://makeagift.stanford.edu/get/page/makeagift?stp=13" />
        </p>
      </section>
    </article>;

  }

}
