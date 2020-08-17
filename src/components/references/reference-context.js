import React from 'react';

export class ReferenceContextValue {

  constructor() {
    this.references = {};
    this.reference_names = [];
  }

  setReference = (name, reference, noIncr = false) => {
    let prevRefDef = {_count: 0};
    if (name in this.references) {
      prevRefDef = this.references[name];
    }
    else {
      // add new reference
      this.reference_names.push(name);
    }
    this.references[name] = {
      ...prevRefDef,
      ...reference
    };
    if (!noIncr) {
      this.references[name]._count ++;
    }
    const refNumber = this.reference_names.indexOf(name) + 1;
    const refLinkNumber = this.references[name]._count;
    return {
      number: refNumber,
      itemId: `${refNumber}_${name}`,
      linkId: `${refNumber}_${name}_${refLinkNumber}`
    };
  }

  hasReference = () => {
    return this.getReferences().some(({linkIds}) => linkIds.length > 0);
  }

  getReference = (name) => {
    return this.references[name];
  }

  getReferences = () => {
    return this.reference_names.map((name, rn0) => {
      const {_count, ...ref} = this.references[name];
      const refNumber = rn0 + 1;
      const linkIds = [];
      for (let rln = 1; rln <= _count; rln ++) {
        linkIds.push(`${refNumber}_${name}_${rln}`);
      }
      return {
        ...ref,
        number: refNumber,
        itemId: `${refNumber}_${name}`,
        linkIds
      };
    });
  }
}


export default React.createContext({});
