import React, { PureComponent } from 'react';
//import * as rangeUtil from '@grafana/ui/src/utils/rangeutil';
//import { toUtc, isDateTime, dateTime } from '@grafana/ui/src/utils/moment_wrapper';
import * as mom from '@grafana/ui/src/utils/moment_wrapper';

import { Project, DATETIME_DEFAULTFORMAT } from '../types';

export interface Props {
  onDelete?: (id: string) => void;
  project: Project;
}

export class ProjectListItem extends PureComponent<Props> {
  render() {
    const { project } = this.props;
    mom.setLocale('ko');
    const created = mom.dateTime(project.created).format(DATETIME_DEFAULTFORMAT);
    const updated = mom.dateTime(project.updated).format(DATETIME_DEFAULTFORMAT);
    const begin = mom.dateTime(project.begin).format(DATETIME_DEFAULTFORMAT);
    const end = mom.dateTime(project.end).format(DATETIME_DEFAULTFORMAT);

    return (
      <li className="card-item-wrapper card-item project-list-item">
        <div className="card-item-header">
          <div className="card-item-name">{project.pilot}<span>&nbsp;&nbsp;</span>
            <a href={`/drone/project/${project.id}/edit`}><span><i className="fa fa-pencil"></i></span></a>
          </div>
          <div className="card-item-type">촬영시작: {begin}</div>
          <div className="card-item-type">촬영종료: {end}</div>
        </div>
        <div className="card-item-body">
          <figure className="card-item-figure">
            <span><i className="fa fa-folder-open"></i></span>
          </figure>
          <div className="card-item-details">
            <div className="card-item-name">
              <a href={`/drone/project/${project.id}/view`}>{project.name} - ({project.site})</a>
            </div>
            <div className="card-item-sub-name">
              생성: {created}
            </div>
            <div className="card-item-sub-name">
              갱신: {updated}
            </div>
            <div className="card-item-notice">
              <span>{project.comment}</span>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default ProjectListItem;
