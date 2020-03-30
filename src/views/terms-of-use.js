import React from 'react';
import {Header} from 'semantic-ui-react';


export default class TermsOfUse extends React.Component {

  render() {

    return <article>
      <Header as="h1" dividing>Terms of Use</Header>
      <section>
        This database is maintained by Stanford University as a benefit to
        the research and education community. This website is provided on
        an "as is" basis only and without warranty or representation,
        whether express or implied, (including warranties of merchantability
        and fitness for a particular purpose) as to its accuracy or
        reliability. Stanford and Stanford Health Care, and their respective
        trustees, officers, employees, students, agents, faculty,
        representatives, and volunteers ("STANFORD INDEMNITEES") are neither
        responsible for nor accept any liability for any direct or indirect
        loss or damages arising from or connected to the use of this
        website. The information provided on this website is intended for
        research and educational purposes and is not intended to substitute
        for care by a licensed healthcare professional.
      </section>
    </article>;

  }

}
