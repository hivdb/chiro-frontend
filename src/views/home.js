import React from 'react';
import {Link} from 'found';
import {Grid, Button} from 'semantic-ui-react';

import blackboard from '../assets/images/blackboard.jpg';


export default class Home extends React.Component {

  render() {

    return <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <img alt="COVID-19" src={blackboard} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={8}>
          <Button color="olive" as={Link} fluid size="huge" to="/literature/">
            Literature Search
          </Button>
        </Grid.Column>
        <Grid.Column width={8}>
          <Button color="brown" as={Link} fluid size="huge" to="/search/">
            Experiments Search
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>;

  }

}
