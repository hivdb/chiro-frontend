import React from 'react';
import {routerShape} from 'found';
import {Grid, Header, Icon, Button} from 'semantic-ui-react';

import {CombinedSearchBox} from '../../components/search-box';
import style from './style.module.scss';


export default class ChiroSearch extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  }

  state = {value: '', category: null}

  handleSearchBoxChange = (value, category) => {
    this.setState({value, category});
  }

  handleSearchClick = () => {
    const {value, category} = this.state;
    const query = {};
    if (category === 'compounds') {
      query.compound = value;
    }
    else {
      query.virus = value;
    }
    this.props.router.push(
      {pathname: '/search-result/', query}
    );
  }

  render() {
    const {value, category} = this.state;
    const preventSearch = category === null;
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
          <CombinedSearchBox
           fluid size="large" value={value}
           onChange={this.handleSearchBoxChange}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column textAlign="center" width={6}>
          <Button
           primary size="large"
           onClick={this.handleSearchClick}
           disabled={preventSearch}>
            Search
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>;
  }

}
