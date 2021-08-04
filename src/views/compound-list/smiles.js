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


function SmilesCanvas({smiles}) {
  const canvas = React.useRef();

  React.useEffect(
    () => SmilesDrawer.parse(smiles, tree => {
      smilesDrawer.draw(tree, this.refs.canvas, "light", false);
    }),
    [smiles]
  );

  return <canvas ref={canvas} className={style['canvas-2d-struct']} />;

}

SmilesCanvas.propTypes = {
  smiles: PropTypes.string.isRequired,
};


export default function Smiles({smiles, children}) {

  const [active, setActive] = React.useState(false);

  const handleClick = React.useCallback(
    e => {
      e.preventDefault();
      setActive(!active);
    },
    [setActive, active]
  );

  if (!smiles) {
    return children(null, null);
  }

  return children(
    <a
     href="#2d-struct"
     onClick={handleClick}>
      2D structure
    </a>,
    this.state.active ? <>
      <Message>
        <SmilesCanvas smiles={smiles} />
      </Message>
    </> : null
  );

}


Smiles.propTypes = {
  smiles: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired
};

