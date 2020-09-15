import React from 'react';

import Collapsable from '../collapsable';
import {HeadingTag} from '../heading-tags';
import References, {ReferenceContext} from '../references';


export default function OptReferences({
  level, disableAnchor, referenceTitle
}) {
  return <ReferenceContext.Consumer>
    {({hasReference}) => hasReference() ? (
      <Collapsable.Section level={level} data-section-reference="">
        <HeadingTag {...{disableAnchor, level}}>{referenceTitle}</HeadingTag>
        <References />
      </Collapsable.Section>
    ) : null}
  </ReferenceContext.Consumer>;
}
