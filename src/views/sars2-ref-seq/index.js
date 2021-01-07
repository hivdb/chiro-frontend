import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, GridColumn, Input, Grid, Item, Segment, TextArea} from 'semantic-ui-react';

import PromiseComponent from '../../utils/promise-component';
import {loadPage} from '../../utils/cms';

import {H2} from '../../components/heading-tags';
import style from './style.module.scss';
import {makeDownload} from 'sierra-frontend/dist/utils/download';


export default class SARS2RefSeq extends React.Component {

  thenRender = ({reference}) => {
    return <>
      <H2>SARS-CoV-2 AA mutation to AA sequence</H2>
      <GeneSeqGenerator reference={reference} />
    </>
  }

  render() {
    return (
      <PromiseComponent
        promise={loadPage('page-sars2-ref-seq')}
        then={this.thenRender}>
      </PromiseComponent>
    );
  }
}

const EMPTY_TEXT = 'Select gene...';


class GeneSeqGenerator extends React.Component {
  static propTypes = {
    reference: PropTypes.object.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      geneName: '',
      mutations: [],
      AASeq: null,
    }
  }

  get geneOptions() {
    const {reference} = this.props;

    const options = Object.keys(reference).map((geneName) => {
      return {
        key: geneName,
        text: geneName,
        value: geneName
      }
    });

    options.sort((a, b) => {
      if (a.key === 'S') {
        return -1;
      }
      if (b.key === 'S') {
        return 1;
      }
      if (a.key.length != b.key.length && (a.key.length < 4 || b.key.length < 4)) {
        return (a.key.length - b.key.length);
      } else if ( a.key < b.key) {
        return -1;
      } else if ( a.key > b.key) {
        return 1;
      } else {
        return 0;
      }
    });

    // options.sort((a, b) => {
    //   if (a['key'] === 'S') {
    //     return -1;
    //   }
    //   if (b['key'] === 'S') {
    //     return 1;
    //   }
    // });

    return options;
  }

  get fastaHeader() {
    const mutation_string = this.state.mutations.map(
      (mut) => mut['display']).join(',');
    return `${this.state.geneName}_${mutation_string}`;
  }

  handleSelectGeneName = (event, {value}) => {
    this.setState({geneName: value});
    this.generateSeq(value, this.state.mutations);
  }

  handleInputMutation = (event, {value}) => {
    const mutations = parseMutationList(value);
    this.setState({mutations});

    this.generateSeq(this.state.geneName, mutations);
  }

  generateSeq = (geneName, mutations) => {
    if (!geneName || !mutations) {
      return;
    }
    mutations = checkRefAAPos(
      this.props.reference, geneName, mutations);
    mutations = fixMutationDisplay(mutations);

    const AASeq =
      generateSequence(this.props.reference, geneName, mutations);

    this.setState({geneName, mutations, AASeq});
  }

  handleCopy = async (e) => {
    e && e.preventDefault();
    navigator.clipboard.writeText(this.dumpFasta());
  }

  dumpFasta = () => {
    const header = `> ${this.fastaHeader}`;
    return `${header}\n${this.state.AASeq}`;
  }

  handleDownload = async(e) => {
    const filename = this.fastaHeader
    makeDownload(
      filename + '.fasta',
      'text/x-fasta;charset=utf-8',
      this.dumpFasta()
    );
  }

  render() {
    return (<Grid columns={2}>
        <GridColumn width={3}>
          <Segment.Group>
            <Segment>
              <label>Gene: </label>
              <Dropdown
                search
                placeholder={EMPTY_TEXT}
                options={this.geneOptions}
                onChange={this.handleSelectGeneName}
                value={this.state.geneName}
                />
            </Segment>
            <Segment>
             <label>AA mutations: </label>
              <TextArea
                type="text"
                name="mutation"
                rows="8"
                onChange={this.handleInputMutation}
                placeholder="Amino acid mutation"
                required />
            </Segment>
          </Segment.Group>
        </GridColumn>
        <GridColumn>
          { (this.state.geneName && this.state.mutations.length > 0) ? <>
            <h3>
              Amino acid Sequence for {this.fastaHeader}
            </h3>
            <p>
              <button onClick={this.handleCopy}>Copy</button>
              <button onClick={this.handleDownload}>Download</button>
            </p>
            <p>
              {"> "}{this.fastaHeader}<wbr/>
              <span className={style['aaseq']}>{this.state.AASeq}</span>
            </p>

            </>:
            <>
              <p><em>Please select gene and input mutations.</em></p>
              <p>Features:</p>
              <ol>
                <li>Support 1 gene + multiple mutations.</li>
                <li>Mutation format: reference amino acid + position + mutation.</li>
                <li>Multiple mutations should be seperated by comma, for example: "D614G+H69del"</li>
                <li>Please use 'del', '-', '∆' behind position to represent deletion.</li>
                <li>Automatically check position exists in gene.</li>
                <li>Automatically correct reference amino acid by mutation.</li>
                <li>You can copy fasta-formated content or download fasta file.</li>
              </ol>
            </>
          }
        </GridColumn>
    </Grid>);
  }
}

function parseMutationList(mutation_list) {
  let mutations = mutation_list.split(',').map((name) => {
    name = name.trim();
    const match = parseMutation(name);
    if (!match) {
      return null
    }
    const result = match.groups;
    if (result['mut'] && ['del', '-', '∆'].includes(result['mut'])) {
      result['mut'] = '-';
    }
    return result;
  });

  mutations = mutations.filter((mut) => mut);

  return mutations
}


function parseMutation(mutation) {
  const pattern = /(?<refAA>[AC-IK-WY]?)(?<pos>\d+)(?<mut>([AC-IK-WY]|\-|∆|del)?)/;
  const match = mutation.match(pattern);
  return match;
}

function checkRefAAPos(reference, geneName, mutations) {
  if (!geneName) {
    return [];
  }
  let result = mutations.map((mut) => {
    const pos = mut['pos']
    const gene = reference[geneName];
    if (!gene) {
      return null
    }
    if (!gene['AA']) {
      return null
    }
    const refAA = gene['AA'][pos-1];
    if (!refAA) {
      return null;
    }
    mut['refAA'] = refAA;
    return mut;
  });

  result = result.filter((mut) => mut);
  return result;
}


function fixMutationDisplay(mutations) {
  return mutations.map((mut) => {
    mut['display'] = `${mut['refAA']}${mut['pos']}${mut['mut']}`;
    return mut;
  })
}

function generateSequence(reference, geneName, mutations) {
  const gene = reference[geneName];
  if (!gene) {
    return null;
  }
  let refAASeq = gene['AA']
  if (!refAASeq) {
    return null;
  }
  refAASeq = refAASeq.split('');
  for (const mut of mutations) {
    const pos = mut['pos']
    if (mut['mut']) {
      refAASeq[pos-1] = mut['mut'];
    }
  }

  return refAASeq.join('');

}
