import React from 'react';
import PropTypes from 'prop-types';

import {
  sanitizeMutations
} from 'sierra-frontend/dist/utils/mutation';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

// eslint-disable-next-line max-len
import MutationsTagsInput from 'sierra-frontend/dist/components/analyze-forms/patterns-input-form/mutations-tagsinput';
// eslint-disable-next-line max-len
import MutationsErrors from 'sierra-frontend/dist/components/analyze-forms/patterns-input-form/mutations-errors';
// import MutationSuggestOptions from './mutation-suggest-options';
// eslint-disable-next-line max-len
import style from 'sierra-frontend/dist/components/analyze-forms/patterns-input-form/style.module.scss';

import useConfig from './hooks/use-config';


function MutationsInputInternal({
  config, mutations, onChange
}) {
  const [,allErrors] = sanitizeMutations(mutations, config);

  React.useEffect(() => {
    if (allErrors.length > 0) {
      onChange({}, true);
    }
  });

  return <div className={style['patterns-input-container']}>
    <div className={style['mutation-suggest-input']}>
      <MutationsTagsInput
       config={config}
       mutations={mutations}
       onChange={handleTagsChange} />
      <MutationsErrors
       allErrors={allErrors}
       onAutoClean={handleRemoveAllErrors} />
      {/*<MutationSuggestOptions
       config={config}
       onChange={handleMutationSelect} />*/}
    </div>
  </div>;

  function handleRemoveAllErrors(e) {
    e.preventDefault();
    const [sanitized] = sanitizeMutations(mutations, config, true);
    onChange({
      mutations: sanitized
    }, false);
  }

  function handleTagsChange(mutations) {
    const [sanitized, allErrors] = sanitizeMutations(mutations, config);
    onChange({
      mutations: sanitized
    }, allErrors.length > 0);
  }

  /* function handleMutationSelect({value: mut, label}) {
    if (mut.length === 0) {
      return;
    }
    else if (label === '*') {
      const aas = prompt(
        `Please enter mutated amino acid(s) at position ${mut}`
      );
      if (aas === null) {
        return;
      }
      mut = `${mut}${aas}`;
    }
    const [sanitized, allErrors] = sanitizeMutations(
      [...mutations, mut], config
    );
    onChange({
      mutations: sanitized
    }, allErrors.length > 0);
  } */

}
  

MutationsInputInternal.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    geneDisplay: PropTypes.object.isRequired
  }),
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};

export default function MutationsInput(props) {
  const {config, isPending} = useConfig();
  if (isPending) {
    return <InlineLoader />;
  }
  return <MutationsInputInternal {...props} config={config} />;
}
