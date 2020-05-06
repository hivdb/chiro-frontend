import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'semantic-ui-react';

import LoadSuggestions from './query';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select one...';


function data2Options(data, filterFunc, allowEmpty, placeholder) {
  return [
    ...(allowEmpty ? [
      {
        key: 'empty',
        text: placeholder || EMPTY_TEXT,
        value: EMPTY
      }
    ] : []),
    ...[{key: 'any', text: 'Any', value: '__ANY'}],
    ...(data
      .filter(filterFunc)
      .map(({title}) => ({key: title, text: title, value: title}))
    )
  ];
}


class SearchBoxInner extends React.Component {

  static propTypes = {
    allowEmpty: PropTypes.bool.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired
    }).isRequired).isRequired,
    articleValue: PropTypes.string,
    compoundValue: PropTypes.string,
    virusValue: PropTypes.string,
    studyTypeValue: PropTypes.string,
    compoundTargetValue: PropTypes.string,
    clinicalTrialCategoryValue: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    dropdownProps: PropTypes.object.isRequired
  }

  static defaultProps = {
    allowEmpty: false,
    articleValue: ANY,
    compoundValue: ANY,
    compoundTargetValue: ANY,
    virusValue: ANY,
    studyTypeValue: ANY,
    clinicalTrialCategoryValue: ANY,
    children: ({
      articleDropdown,
      compoundTargetDropdown,
      compoundDropdown,
      virusDropdown,
      studyTypeDropdown
    }) => (
      <span>
        Showing experiment data for{' '}
        {articleDropdown}{' '}article,{' '}
        {compoundTargetDropdown}{' '}target,{' '}
        {compoundDropdown}
        {' '}compound,{' '}
        {virusDropdown}
        {' '}virus and{' '}
        {studyTypeDropdown}.
      </span>
    ),
    dropdownProps: {}
  }

  get articleOptions() {
    const {data, allowEmpty, placeholder} = this.props;
    return data2Options(
      data, ({category}) => category === 'articles',
      allowEmpty, placeholder);
  }

  get targetOptions() {
    const {data, allowEmpty, placeholder} = this.props;
    return data2Options(
      data, ({category}) => category === 'compoundTargets',
      allowEmpty, placeholder);
  }

  get compoundOptions() {
    const {data, compoundTargetValue, allowEmpty, placeholder} = this.props;
    let filter = ({status, category}) => (
      status === 'visible' && category === 'compounds'
    );
    if (compoundTargetValue && compoundTargetValue !== ANY) {
      filter = ({displayTargets, category}) => (
        category === 'compounds' &&
        displayTargets.indexOf(compoundTargetValue) > -1
      );
    }
    return data2Options(data, filter, allowEmpty, placeholder);
  }

  getTargetFromCompound(compoundName) {
    const {data} = this.props;
    return (
      data
        .filter(({category, title}) => (
          category === 'compounds' && title === compoundName
        ))
    )[0].directTarget;
  }

  get virusOptions() {
    const {data, allowEmpty, placeholder} = this.props;
    return data2Options(
      data, ({category}) => category === 'viruses',
      allowEmpty, placeholder);
  }

  get clinicalTrialCategoryOptions() {
    const {data, allowEmpty, placeholder} = this.props;
    return data2Options(
      data, ({category}) => category === 'clinicalTrialCategories',
      allowEmpty, placeholder);
  }

  get studyTypeOptions() {
    const {allowEmpty, placeholder} = this.props;
    return [
      ...(allowEmpty ? [
        {
          key: 'empty',
          text: placeholder || EMPTY_TEXT,
          value: EMPTY
        }
      ] : []),
      {
        key: 'any',
        text: 'Any',
        value: ANY
      },
      {
        key: 'invitro-cells',
        text: 'Cell culture',
        value: 'invitro-cells'
      },
      {
        key: 'invitro-entryassay',
        text: 'Entry assay',
        value: 'invitro-entryassay'
      },
      {
        key: 'invitro-biochem',
        text: 'Biochemistry',
        value: 'invitro-biochem'
      },
      {
        key: 'animal-models',
        text: 'Animal models',
        value: 'animal-models'
      },
      {
        key: 'clinical-studies',
        text: 'Clinical studies',
        value: 'clinical-studies'
      }
    ];
  }

  handleChange = category => (event, {value}) => {
    if (value === EMPTY) {
      return;
    }
    if (value === ANY) {
      value = null;
    }
    const actions = [];
    if (category === 'compoundTargets') {
      actions.push([null, 'compounds']);
    }
    if (category === 'compounds' && value) {
      const target = this.getTargetFromCompound(value);
      actions.push([target, 'compoundTargets']);
    }
    actions.push([value, category]);
    this.props.onChange(actions);
  }

  render() {
    const {
      articleValue,
      compoundTargetValue,
      compoundValue, virusValue,
      placeholder,
      studyTypeValue, clinicalTrialCategoryValue,
      children, dropdownProps
    } = this.props;
    return children({
      articleDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.articleOptions}
         onChange={this.handleChange('articles')}
         value={articleValue} />
      ),
      compoundTargetDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.targetOptions}
         onChange={this.handleChange('compoundTargets')}
         value={compoundTargetValue} />
      ),
      compoundDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.compoundOptions}
         onChange={this.handleChange('compounds')}
         value={compoundValue} />
      ),
      virusDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.virusOptions}
         onChange={this.handleChange('viruses')}
         value={virusValue} />
      ),
      studyTypeDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.studyTypeOptions}
         onChange={this.handleChange('studyTypes')}
         value={studyTypeValue} />
      ),
      clinicalTrialCategoryDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={placeholder || EMPTY_TEXT}
         options={this.clinicalTrialCategoryOptions}
         onChange={this.handleChange('clinicalTrialCategories')}
         value={clinicalTrialCategoryValue} />
      )
    });
  }

}


export default function InlineSearchBox(props) {
  return <LoadSuggestions>
    {data => <SearchBoxInner {...props} data={data} />}
  </LoadSuggestions>;
}
