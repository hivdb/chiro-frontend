import React from 'react';
import PropTypes from 'prop-types';
import SmilesDrawer from 'smiles-drawer';
import {Modal} from 'semantic-ui-react';

const smilesDrawer = new SmilesDrawer.Drawer({
  width: 800,
  height: 400,
  bondLength: 20,
  compactDrawing: false,
  isometric: true,
  overlapSensitivity: 0.9,
  overlapResolutionIterations: 3,
  debug: false
});


export default class SmilesModal extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    smiles: PropTypes.string.isRequired
  }

  handleMount = () => {
    const {smiles} = this.props;
    SmilesDrawer.parse(smiles, tree => {
      smilesDrawer.draw(tree, "canvas-2d-struct", "light", false);
    });
  }

  render() {
    const {name} = this.props;

    return (
      <Modal
       closeIcon
       onMount={this.handleMount}
       trigger={<a href="#smiles" onClick={e => e.preventDefault()}>
         2D structure
       </a>}
       centered={false}>
        <Modal.Header>2D structure of “{name}”</Modal.Header>
        <Modal.Content>
          <canvas id="canvas-2d-struct" />
        </Modal.Content>
      </Modal>
    );

  }

}
