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
    articlePlaceholder: PropTypes.string,
    compoundPlaceholder: PropTypes.string,
    virusPlaceholder: PropTypes.string,
    studyTypePlaceholder: PropTypes.string,
    compoundTargetPlaceholder: PropTypes.string,
    clinicalTrialCategoryPlaceholder: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    dropdownProps: PropTypes.object.isRequired,
    compoundListFilter: PropTypes.func
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

  constructor() {
    super(...arguments);
    this.state = {
      searching: null
    };
  }

  get articleOptions() {
    const {data, allowEmpty, placeholder, articlePlaceholder} = this.props;
    return data2Options(
      data,
      ({category}) => category === 'articles',
      allowEmpty,
      articlePlaceholder || placeholder
    );
  }

  get targetOptions() {
    const {
      data, allowEmpty, placeholder,
      compoundTargetPlaceholder
    } = this.props;
    return data2Options(
      data,
      ({category}) => category === 'compoundTargets',
      allowEmpty,
      compoundTargetPlaceholder || placeholder
    );
  }

  get compoundOptions() {
    const {
      data, compoundTargetValue, allowEmpty,
      compoundPlaceholder, placeholder, compoundListFilter
    } = this.props;

    let filter = ({status, category}) => {
      const {searching} = this.state;
      if (searching) {
        return category === 'compounds';
      }
      else {
        return status === 'visible' && category === 'compounds';
      }
    };
    if (compoundTargetValue && compoundTargetValue !== ANY) {
      filter = ({displayTargets, category}) => (
        category === 'compounds' &&
        displayTargets.indexOf(compoundTargetValue) > -1
      );
    }
    if (compoundListFilter) {
      const origFilter = filter;
      filter = (args) => (
        origFilter(args) && compoundListFilter(args)
      );
    }
    return data2Options(
      data,
      filter,
      allowEmpty,
      compoundPlaceholder || placeholder
    );
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
    const {data, allowEmpty, virusPlaceholder, placeholder} = this.props;
    return data2Options(
      data,
      ({category}) => category === 'viruses',
      allowEmpty,
      virusPlaceholder || placeholder
    );
  }

  get clinicalTrialCategoryOptions() {
    const {
      data, allowEmpty, placeholder,
      clinicalTrialCategoryPlaceholder
    } = this.props;
    return data2Options(
      data,
      ({category}) => category === 'clinicalTrialCategories',
      allowEmpty,
      clinicalTrialCategoryPlaceholder || placeholder
    );
  }

  get studyTypeOptions() {
    const {allowEmpty, studyTypePlaceholder, placeholder} = this.props;
    return [
      ...(allowEmpty ? [
        {
          key: 'empty',
          text: studyTypePlaceholder || placeholder || EMPTY_TEXT,
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
        key: 'invitro-fusionassay',
        text: 'Fusion assay',
        value: 'invitro-fusionassay'
      },
      {
        key: 'invitro-pseudovirus',
        text: 'Pseudovirus Entry',
        value: 'invitro-pseudovirus'
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
    this.setState({searching: null});
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

  handleSearchChange = category => (event, {searchQuery}) => {
    if (searchQuery === '') {
      this.setState({searching: null});
    }
    else {
      this.setState({searching: category});
    }
  }

  render() {
    const {
      articleValue,
      compoundTargetValue,
      compoundValue, virusValue,
      studyTypeValue, clinicalTrialCategoryValue,
      articlePlaceholder,
      compoundTargetPlaceholder,
      compoundPlaceholder, virusPlaceholder,
      studyTypePlaceholder, clinicalTrialCategoryPlaceholder,
      placeholder,
      children, dropdownProps
    } = this.props;
    return children({
      articleDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={articlePlaceholder || placeholder || EMPTY_TEXT}
         options={this.articleOptions}
         onChange={this.handleChange('articles')}
         value={articleValue} />
      ),
      compoundTargetDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={compoundTargetPlaceholder || placeholder || EMPTY_TEXT}
         options={this.targetOptions}
         onChange={this.handleChange('compoundTargets')}
         value={compoundTargetValue} />
      ),
      compoundDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={compoundPlaceholder || placeholder || EMPTY_TEXT}
         options={this.compoundOptions}
         onChange={this.handleChange('compounds')}
         onSearchChange={this.handleSearchChange('compounds')}
         value={compoundValue} />
      ),
      virusDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={virusPlaceholder || placeholder || EMPTY_TEXT}
         options={this.virusOptions}
         onChange={this.handleChange('viruses')}
         value={virusValue} />
      ),
      studyTypeDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={studyTypePlaceholder || placeholder || EMPTY_TEXT}
         options={this.studyTypeOptions}
         onChange={this.handleChange('studyTypes')}
         value={studyTypeValue} />
      ),
      clinicalTrialCategoryDropdown: (
        <Dropdown
         search direction="left"
         {...dropdownProps}
         placeholder={
           clinicalTrialCategoryPlaceholder ||
           placeholder || EMPTY_TEXT
         }
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
