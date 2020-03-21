import React from 'react';
import {Grid, Header, Icon} from 'semantic-ui-react';

import SearchBox from './search-box';
import style from './style.module.scss';


export default class ChiroSearch extends React.Component {

  state = {value: ''}

  handleSearchBoxChange = (value) => {
    this.setState({value});
  }

  render() {
    const {value} = this.state;
    return <Grid>
      <Grid.Row centered>
        <Grid.Column width={6}>
          <Header
           className={style["search-header"]}
           textAlign="center"
           as="h2" icon>
            <Icon name="search" />
            CoVRx Search
            <Header.Subheader>
              Search experiment data for compounds and viruses.
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={6}>
          <SearchBox
           fluid size="large" value={value}
           onChange={this.handleSearchBoxChange}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>;
  }

}
