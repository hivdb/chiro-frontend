import React from 'react';
import {routerShape} from 'found';
import {
  Grid, Header, Breadcrumb
} from 'semantic-ui-react';

import {InlineSearchBox} from '../../components/search-box';
import style from './style.module.scss';


export default class ChiroSearch extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  }

  handleSearchBoxChange = (value, category) => {
    if (value === null) {
      return;
    }
    const query = {};
    if (category === 'compounds') {
      query.compound = value;
    }
    else if (category === 'compoundTargets') {
      query.target = value;
    }
    else {
      query.virus = value;
    }
    this.props.router.push(
      {pathname: '/search-result/', query}
    );
  }

  renderBreadcrumb() {
    return <Breadcrumb>
      <Breadcrumb.Section href="/">Home</Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      <Breadcrumb.Section active>
        Experiment Search
      </Breadcrumb.Section>
    </Breadcrumb>;
  }

  render() {
    return <Grid className={style.search}>
      {/*<Grid.Row>{this.renderBreadcrumb()}</Grid.Row>*/}
      <Grid.Row centered>
        <Grid.Column width={6}>
          <Header
           textAlign="center"
           as="h2">
            Experiment Search
            <Header.Subheader>
              Search compounds, targets, and viruses.
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={10}>
          <InlineSearchBox
           noAny
           compoundValue={null}
           compoundTargetValue={null}
           virusValue={null}
           onChange={this.handleSearchBoxChange}
           dropdownProps={{selection: true, fluid: true}}>
            {({
              compoundTargetDropdown,
              compoundDropdown,
              virusDropdown
            }) => (
              <Grid columns={3}>
                <Grid.Column>
                  {virusDropdown}
                </Grid.Column>
                <Grid.Column>
                  {compoundTargetDropdown}
                </Grid.Column>
                <Grid.Column>
                  {compoundDropdown}
                </Grid.Column>
              </Grid>
            )}
          </InlineSearchBox>
        </Grid.Column>
      </Grid.Row>
    </Grid>;
  }

}
