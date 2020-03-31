import defer from 'lodash/defer';

export default function handleQueryChange(value, category, props) {
  const {
    router,
    match: {
      location: {pathname, query}
    },
    compound
  } = props;
  const newQuery = {...query};
  delete newQuery.article;
  value = value || undefined;
  let changed = false;
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
  else {  // viruses
    if (value !== query.virus) {
      newQuery.virus = value;
      changed = true;
    }
  }
  if (changed) {
    defer(() => router.push({pathname, query: newQuery}));
  }
}
