import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'semantic-ui-react';

import LoadSuggestions from './query';


const NULLSTR = '__NULLSTR';


function data2Options(data, categoryOnly) {
  return [
    {key: 'any', text: 'Any', value: '__NULLSTR'},
    ...(data
      .filter(({category}) => category === categoryOnly)
      .map(({title}) => ({key: title, text: title, value: title}))
    )
  ];
}


class SearchBoxInner extends React.Component {

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    compoundValue: PropTypes.string.isRequired,
    virusValue: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  }

  static defaultProps = {
    compoundValue: NULLSTR,
    virusValue: NULLSTR,
    children: ({compoundDropdown, virusDropdown}) => (
      <span>
        Showing experiment data for{' '}
        {compoundDropdown}
        {' '}compound and{' '}
        {virusDropdown}
        {' '}virus.
      </span>
    )
  }

  get compoundOptions() {
    return data2Options(this.props.data, 'compounds');
  }

  get virusOptions() {
    return data2Options(this.props.data, 'viruses');
  }

  handleChange = category => (event, {value}) => {
    if (value === NULLSTR) {
      value = null;
    }
    this.props.onChange(value, category);
  }

  render() {
    let {compoundValue, virusValue, children} = this.props;
    compoundValue = compoundValue || NULLSTR;
    virusValue = virusValue || NULLSTR;
    return children({
      compoundDropdown: (
        <Dropdown
         inline search direction="left"
         options={this.compoundOptions}
         onChange={this.handleChange('compounds')}
         value={compoundValue} />
      ),
      virusDropdown: (
        <Dropdown
         inline search direction="left"
         options={this.virusOptions}
         onChange={this.handleChange('viruses')}
         value={virusValue} />
      )
    });
  }

}


export default function InlineSearchBox(props) {
  return <LoadSuggestions>
    {data => <SearchBoxInner {...props} data={data} />}
  </LoadSuggestions>;
}
