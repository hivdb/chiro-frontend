import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {Link} from 'found';
import Markdown from 'sierra-frontend/dist/components/markdown';
import {H2} from 'sierra-frontend/dist/components/heading-tags';
import style from './style.module.scss';


function trimTags(text) {
  return text.replace(/<[^>]+>/g, '').trim();
}


export function Projects({className, projects = [], imagePrefix}) {
  return <ul className={classNames(style['list-projects'], className)}>
    {projects.map(({
      title, description, link, extLink, image
    }, idx) => (
      <li key={idx}>
        {extLink ?
          <>
            <a
             className={style['image-trimmer']}
             rel="noopener noreferrer"
             href={link} target="_blank">
              <img src={`${imagePrefix}${image}`} alt={trimTags(title)} />
            </a>
            <a
             className={style['project-title']}
             rel="noopener noreferrer"
             href={link} target="_blank">
              <Markdown inline escapeHtml={false}>
                {title}
              </Markdown>
            </a>
          </> : <>
            <Link
             className={style['image-trimmer']}
             to={link}>
              <img src={`${imagePrefix}${image}`} alt={trimTags(title)} />
            </Link>
            <Link
             className={style['project-title']}
             to={link}>
              <Markdown inline escapeHtml={false}>
                {title}
              </Markdown>
            </Link>
          </>
        }
        <div className={style['project-desc']}>
          <Markdown inline escapeHtml={false}>
            {description}
          </Markdown>
        </div>
      </li>
    ))}
  </ul>;
}

Projects.propTypes = {
  className: PropTypes.string,
  projects: PropTypes.array,
  imagePrefix: PropTypes.string.isRequired
};


export default function ProjectsSection({
  title,
  displayTitle = true,
  projects = [],
  imagePrefix
}) {

  return (
    <section className={style['projects-section']}>
      {displayTitle ? <H2 disableAnchor>{title}</H2> : null}
      <Projects projects={projects} imagePrefix={imagePrefix} />
    </section>
  );
}

ProjectsSection.propTypes = {
  title: PropTypes.node,
  displayTitle: PropTypes.bool,
  projects: PropTypes.array,
  imagePrefix: PropTypes.string.isRequired
};
