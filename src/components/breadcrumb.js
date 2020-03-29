import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {
  Grid, Breadcrumb as SUBreadcrumb
} from 'semantic-ui-react';


export default class Breadcrumb extends React.Component {

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      linkTo: PropTypes.string,
      active: PropTypes.boolean
    }).isRequired).isRequired
  }

  render() {
    const {children: sections} = this.props;

    return <Grid.Row>
      <Grid.Column width={16}>
        <SUBreadcrumb>
          {sections.map(({label, linkTo, active}, idx) => [
            <SUBreadcrumb.Section
             key={idx}
             active={active}
             {...(linkTo ? {as: Link, to: linkTo} : {})}>
              {label}
            </SUBreadcrumb.Section>,
            idx < sections.length - 1 ?
              <SUBreadcrumb.Divider
               key={`d${idx}`}
               icon="right angle" /> : null
          ])}
        </SUBreadcrumb>
      </Grid.Column>
    </Grid.Row>;
  }

}
