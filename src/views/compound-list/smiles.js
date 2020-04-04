import React from 'react';
import PropTypes from 'prop-types';
import SmilesDrawer from 'smiles-drawer';
import {Message} from 'semantic-ui-react';

import style from './style.module.scss';

const smilesDrawer = new SmilesDrawer.Drawer({
  width: 400,
  height: 200,
  bondLength: 20,
  compactDrawing: false,
  isometric: true,
  overlapSensitivity: 0.9,
  overlapResolutionIterations: 3,
  debug: false
});


class SmilesCanvas extends React.Component {

  componentDidMount() {
    const {smiles} = this.props;
    SmilesDrawer.parse(smiles, tree => {
      smilesDrawer.draw(tree, this.refs.canvas, "light", false);
    });
  }

  render() {
    return <canvas ref="canvas" className={style['canvas-2d-struct']} />;
  }

}


export default class Smiles extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    smiles: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  }

  state = {active: false}

  handleClick = e => {
    e.preventDefault();
    this.setState({active: !this.state.active});
  }

  render() {
    const {smiles, children} = this.props;
    if (!smiles) {
      return children(null, null);
    }

    return children(
      <a
       href="#2d-struct"
       onClick={this.handleClick}>
        2D structure
      </a>,
      this.state.active ? <>
        <Message>
          <SmilesCanvas smiles={smiles} />
        </Message>
      </> : null
    );

  }

}
