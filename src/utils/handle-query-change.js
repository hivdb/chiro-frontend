import defer from 'lodash/defer';

export default function handleQueryChange(actions, props) {
  const {
    router,
    match: {
      location: {pathname, query}
    },
    compound
  } = props;
  const newQuery = {...query};
  delete newQuery.article;
  let changed = false;
  for (let [value, category] of actions) {
    value = value || undefined;
    if (category === 'compounds') {
      if (value !== query.compound) {
        newQuery.compound = value;
        changed = true;
      }
    }
    else if (category === 'compoundTargets') {
      if (value !== query.target) {
        newQuery.target = value;
        if (value && compound && value !== compound.target) {
          delete newQuery.compound;
        }
        changed = true;
      }
    }
    else if (category === 'articles') {
      if (value !== query.article) {
        newQuery.article = value;
        changed = true;
      }
    }
    else if (category === 'studyTypes') {
      newQuery.study = value;
      changed = true;
    }
    else if (category === 'clinicalTrialCategories') {
      if (value !== query.trialcat) {
        newQuery.trialcat = value;
        changed = true;
      }
    }
    else {  // viruses
      if (value !== query.virus) {
        newQuery.virus = value;
        changed = true;
      }
    }
  }
  if (changed) {
    defer(() => router.push({pathname, query: newQuery}));
  }
}
