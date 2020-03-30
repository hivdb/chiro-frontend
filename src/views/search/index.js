import React from 'react';
import {routerShape} from 'found';
import {Grid, Header} from 'semantic-ui-react';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import style from './style.module.scss';


export default class ChiroSearch extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  }

  handleSearchBoxChange = (value, category) => {
    if (value === null) {
      this.props.router.push({pathname: '/search-result/'});
      return;
    }
    const query = {};
    if (category === 'articles') {
      query.article = value;
    }
    else if (category === 'compounds') {
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

  render() {
    return <Grid className={style.search}>
      {/*<Breadcrumb>
        {[
          {linkTo: '/', label: 'Home'},
          {active: true, label: 'Experiment Search'}
        ]}
      </Breadcrumb>*/}
      <Grid.Row>
        <InlineSearchBox
         articleValue={null}
         compoundValue={null}
         virusValue={null}
         compoundTargetValue={null}
         onChange={this.handleSearchBoxChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown
          }) => (
            <StatHeader>
              {[
                {
                  width: 12,
                  description: <>
                    <Header as="h2" textAlign="center">
                      Cell culture, animal model, and clinical data on compounds
                      with proven or potential anti-coronavirus activity
                    </Header>
                    <p className={style['header-content']}>
                      TYPE OF COMPOUNDS: Targeted antivirals, investigational
                      agents, monoclonal antibodies, interferons, repurposed
                      drugs, and promising leads.
                    </p>
                    <p className={style['header-content']}>
                      TYPES OF STUDIES: Cell culture, animal model, and clinical
                      data on compounds with proven or potential
                      anti-coronavirus activity.
                    </p>
                  </>
                },
                {
                  title: 'Search',
                  width: 4,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown},
                  ]
                }
              ]}
            </StatHeader>
          )}
        </InlineSearchBox>
      </Grid.Row>
    </Grid>;
  }

}
