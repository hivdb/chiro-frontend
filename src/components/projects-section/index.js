import React from 'react';
import classNames from 'classnames';

import {Link} from 'found';
import {H2} from 'sierra-frontend/dist/components/heading-tags';
import style from './style.module.scss';


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
              <img src={`${imagePrefix}${image}`} alt={title} />
            </a>
            <a
             className={style['project-title']}
             rel="noopener noreferrer"
             href={link} target="_blank">{title}</a>
          </> : <>
            <Link
             className={style['image-trimmer']}
             to={link}>
              <img src={`${imagePrefix}${image}`} alt={title} />
            </Link>
            <Link
             className={style['project-title']}
             to={link}>
              {title}
            </Link>
          </>
        }
        <div className={style['project-desc']}>{description}</div>
      </li>
    ))}
  </ul>;
}


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
