import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'semantic-ui-react';

import LoadSuggestions from './query';


const ANY = '__ANY';


function data2Options(data, filterFunc, noAnyText) {
  return [
    ...[{key: 'any', text: noAnyText || 'Any', value: '__ANY'}],
    ...(data
      .filter(filterFunc)
      .map(({title}) => ({key: title, text: title, value: title}))
    )
  ];
}


class SearchBoxInner extends React.Component {

  static propTypes = {
    noAny: PropTypes.bool.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired
    }).isRequired).isRequired,
    articleValue: PropTypes.string,
    compoundValue: PropTypes.string,
    virusValue: PropTypes.string,
    compoundTargetValue: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    dropdownProps: PropTypes.object.isRequired
  }

  static defaultProps = {
    noAny: false,
    articleValue: ANY,
    compoundValue: ANY,
    compoundTargetValue: ANY,
    virusValue: ANY,
    children: ({
      articleDropdown,
      compoundTargetDropdown,
      compoundDropdown,
      virusDropdown
    }) => (
      <span>
        Showing experiment data for{' '}
        {articleDropdown}{' '}article,{' '}
        {compoundTargetDropdown}{' '}target,{' '}
        {compoundDropdown}
        {' '}compound and{' '}
        {virusDropdown}
        {' '}virus.
      </span>
    ),
    dropdownProps: {}
  }

  get articleOptions() {
    const {data, noAny} = this.props;
    return data2Options(
      data, ({category}) => category === 'articles',
      noAny && 'Input/select an article...');
  }

  get targetOptions() {
    const {data, noAny} = this.props;
    return data2Options(
      data, ({category}) => category === 'compoundTargets',
      noAny && 'Input/select a target...');
  }

  get compoundOptions() {
    const {data, compoundTargetValue, noAny} = this.props;
    let filter = ({category}) => category === 'compounds';
    if (compoundTargetValue && compoundTargetValue !== ANY) {
      filter = ({target, category}) => (
        category === 'compounds' &&
        target === compoundTargetValue
      );
    }
    return data2Options(
      data, filter,
      noAny && 'Input/select a compound...');
  }

  get virusOptions() {
    const {data, noAny} = this.props;
    return data2Options(
      data, ({category}) => category === 'viruses',
      noAny && 'Input/select a virus...');
  }

  handleChange = category => (event, {value}) => {
    if (value === ANY) {
      value = null;
    }
    this.props.onChange(value, category);
  }

  render() {
    const {
      articleValue,
      compoundTargetValue,
      compoundValue, virusValue,
      children, dropdownProps
    } = this.props;
    return children({
      articleDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Select one..."
         options={this.articleOptions}
         onChange={this.handleChange('articles')}
         value={articleValue} />
      ),
      compoundTargetDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Select one..."
         options={this.targetOptions}
         onChange={this.handleChange('compoundTargets')}
         value={compoundTargetValue} />
      ),
      compoundDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Select one..."
         options={this.compoundOptions}
         onChange={this.handleChange('compounds')}
         value={compoundValue} />
      ),
      virusDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder="Select one..."
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
