import React from 'react';
import {Link} from 'found';
import {Grid, Header} from 'semantic-ui-react';

import style from './style.module.scss';

export default class Footer extends React.Component {

  render() {

    return <footer className={style['footer']}>
      <Grid columns={3} relaxed stackable>
        <Grid.Column>
          <Header as="h2">Databases</Header>
          <ul>
            <li><Link to="/terms-of-use/">Terms of Use</Link></li>
          </ul>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">Team</Header>
          <ul>
            <li>
              <a href="https://hivdb.stanford.edu/">
                Who We Are
              </a>
            </li>
            <li>
              <a href="https://hivdb.stanford.edu/about/contactus/">
                How to Contact Us
              </a>
            </li>
          </ul>
        </Grid.Column>
        <Grid.Column>
        </Grid.Column>
      </Grid>
      <div className={style.copyright}>
        © 2020. All Rights Reserved. Questions? Contact{' '}
        <a href="mailto:hivdbteam@stanford.edu">HIVDB team</a>.
      </div>
    </footer>;


  }

}
