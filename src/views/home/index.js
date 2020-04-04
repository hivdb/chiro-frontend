import React from 'react';
import {routerShape} from 'found';
import {Grid, Header} from 'semantic-ui-react';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


export default class ChiroSearch extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  }

  handleSearchBoxChange = (value, category) => {
    if (value === null) {
      this.props.router.push({pathname: '/search/'});
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
    else if (category === 'studyTypes') {
      query.study = value;
    }
    else {
      query.virus = value;
    }
    this.props.router.push(
      {pathname: '/search/', query}
    );
  }

  render() {
    setTitle(null);
    return <Grid stackable className={style.home}>
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as="h2" textAlign="center" className={style.title}>
            Cell culture, animal model, and clinical data on compounds
            with proven or potential anti-coronavirus activity
          </Header>
          <p className={style['header-content']}>
            Targeted antivirals, investigational
            agents, monoclonal antibodies, interferons, repurposed
            drugs, and promising leads.
          </p>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <InlineSearchBox
         allowEmpty
         articleValue={null}
         compoundValue={null}
         virusValue={null}
         studyTypeValue={null}
         compoundTargetValue={null}
         onChange={this.handleSearchBoxChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown,
            studyTypeDropdown
          }) => (
            <StatHeader>
              {[
                {
                  title: 'Search',
                  width: 4,
                  cells: [
                    {label: 'Target', value: compoundTargetDropdown},
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Virus', value: virusDropdown},
                    {label: 'Study Type', value: studyTypeDropdown},
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
