import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {Header} from 'semantic-ui-react';
import Banner from '../../components/banner';
import PromiseComponent from '../../utils/promise-component';
import setTitle from '../../utils/set-title';

import style from './style.module.scss';


class MutationViewerLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    children: PropTypes.node,
    lastModified: PropTypes.string.isRequired,
    pageTitle: PropTypes.string.isRequired,
    heroImage: PropTypes.string.isRequired,
    imagePrefix: PropTypes.string.isRequired,
    presets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired
      }).isRequired
    )
  };

  get preset() {
    const {presets} = this.props;
    const {match: {location: {pathname}}} = this.props;
    const split = pathname.replace(/\/$/, '').split('/');
    const presetName = split[split.length - 1];
    return presets.find(({name}) => name === presetName);
  }

  render() {
    const {preset} = this;
    const {
      pageTitle, heroImage, imagePrefix,
      lastModified, children
    } = this.props;
    let title = pageTitle;
    if (preset) {
      title += ` - ${preset.label}`;
    }
    const lastMod = new Date(lastModified).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    setTitle(title);

    return <main className={style['mutation-viewer-container']}>
      {heroImage && !preset ?
        <Banner bgImage={`${imagePrefix}${heroImage}`} narrow>
          <Banner.Title as="h1">
            {title}
          </Banner.Title>
          <Banner.Subtitle>
            <span className={style['last-update']}>
              Last updated on {lastMod}
            </span>
          </Banner.Subtitle>
        </Banner> :
        <Header as="h1" dividing>
          {title}
          <Header.Subheader>
            <span className={style['last-update']}>
              Last updated on {lastMod}
            </span>
          </Header.Subheader>
        </Header>}
      {children}
    </main>;

  }

}


export default function MutationViewerLayoutLoader(props) {
  const {indexLoader} = props;
  return (
    <PromiseComponent
     promise={(async () => {
       const payload = await indexLoader();
       return {...props, ...payload};
     })()}
     component={MutationViewerLayout} />
  );
}

MutationViewerLayoutLoader.propTypes = {
  indexLoader: PropTypes.func.isRequired
};
