import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'semantic-ui-react';

import LoadSuggestions from './query';


const ANY = '__ANY';


function data2Options(data, categoryOnly) {
  return [
    {key: 'any', text: 'Any', value: '__ANY'},
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
    compoundValue: PropTypes.string,
    virusValue: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    dropdownProps: PropTypes.object.isRequired
  }

  static defaultProps = {
    compoundValue: ANY,
    virusValue: ANY,
    children: ({compoundDropdown, virusDropdown}) => (
      <span>
        Showing experiment data for{' '}
        {compoundDropdown}
        {' '}compound and{' '}
        {virusDropdown}
        {' '}virus.
      </span>
    ),
    dropdownProps: {}
  }

  get compoundOptions() {
    return data2Options(this.props.data, 'compounds');
  }

  get virusOptions() {
    return data2Options(this.props.data, 'viruses');
  }

  handleChange = category => (event, {value}) => {
    if (value === ANY) {
      value = null;
    }
    this.props.onChange(value, category);
  }

  render() {
    const {
      compoundValue, virusValue,
      children, dropdownProps
    } = this.props;
    return children({
      compoundDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Compound"
         options={this.compoundOptions}
         onChange={this.handleChange('compounds')}
         value={compoundValue} />
      ),
      virusDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Virus"
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
