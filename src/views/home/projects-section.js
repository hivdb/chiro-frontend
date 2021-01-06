import React from 'react';

import {Link} from 'found';
import {H2} from 'sierra-frontend/dist/components/heading-tags';
import style from './style.module.scss';


export default function ProjectsSection({title, projects = [], imagePrefix}) {

  return (
    <section className={style['home-section']}>
      <H2 disableAnchor>{title}</H2>
      <ul className={style['list-projects']}>
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
      </ul>
    </section>
  );

}
