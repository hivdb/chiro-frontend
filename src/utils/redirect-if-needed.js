import defer from 'lodash/defer';

export default function redirectIfNeeded(props) {
  const {
    router,
    match: {
      location: {pathname, query}
    },
    qArticleNickname = null,
    qCompoundTargetName = null,
    qCompoundName = null,
    qVirusName = null,
    article,
    compoundTarget,
    compound,
    virus
  } = props;

  const newQuery = {...query};
  let changed = false;

  if (article && qArticleNickname !== article.nickname[0]) {
    newQuery.article = article.nickname[0];
    changed = true;
  }

  if (compoundTarget && qCompoundTargetName !== compoundTarget.name) {
    newQuery.target = compoundTarget.name;
    changed = true;
  }

  if (compound && qCompoundName !== compound.name) {
    newQuery.compound = compound.name;
    changed = true;
  }

  if (virus && qVirusName !== virus.name) {
    newQuery.virus = virus.name;
    changed = true;
  }
  if (changed) {
    defer(() => router.replace({pathname, query: newQuery}));
  }
}
