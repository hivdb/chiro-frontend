import React from 'react';
import {routerShape} from 'found';
import {Grid} from 'semantic-ui-react';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import Breadcrumb from '../../components/breadcrumb';
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
      <Breadcrumb>
        {[
          {linkTo: '/', label: 'Home'},
          {active: true, label: 'Experiment Search'}
        ]}
      </Breadcrumb>
      <Grid.Row>
        <InlineSearchBox
         articleValue={null}
         compoundValue={null}
         virusValue={null}
         compoundTargetValue={null}
         onChange={this.handleSearchBoxChange}>
          {({
            compoundDropdown,
            compoundTargetDropdown,
            virusDropdown
          }) => (
            <StatHeader>
              {[
                {
                  title: 'Selection',
                  width: 3,
                  cells: [
                    {label: 'Compound', value: compoundDropdown},
                    {label: 'Target', value: compoundTargetDropdown},
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
