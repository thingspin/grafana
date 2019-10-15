// js 3rd party libs
import React, { PureComponent, useState } from 'react';

// Grafana libs
import * as mom from '@grafana/data';
import { CoreEvents } from 'app/types';
import { appEvents } from 'app/core/core';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// Thingspin libs
import { loadProject } from '../state/actions';
import { DATETIME_DEFAULTFORMAT } from '../types';
import { ProjectInfoProps, ProjectInfoState } from '../types';

export class ProjectInfo extends PureComponent<ProjectInfoProps, ProjectInfoState> {
    state: ProjectInfoState = {
        isLoading: true,
        project: null,
    };

    unsubscribe: any;

    constructor(props: ProjectInfoProps) {
        super(props);
        const { store } = this.props;

        this.unsubscribe = store.subscribe(() => {
            const state = store.getState()['droneProject'];
            this.setState({ project: state.project });
        });
    }

    async componentWillMount() {
        const { id } = this.props.params;
        this.props.loadProject(id);
    }

    async componentWillUnmount() {
        this.unsubscribe();
    }

    onDelete = () => {
      const { id } = this.state.project;

      appEvents.emit(CoreEvents.showConfirmModal, {
        title: '프로젝트 삭제',
        text: '정말 프로젝트를 삭제 하시겠습니까?',
        icon: 'fa-superpowers',
        onConfirm: () => {
          getBackendSrv().delete(`api/drone/project/` + id).then( () => {
            history.back();
          });
        },
      });
    }

    render() {
        const { project } = this.state;

        if ( project === null) {
            return null;
        }

        return <ProjectBasicInfo key="p2" project={project} onDelete={this.onDelete}/>;
    }
}

const ProjectBasicInfo = (props: any) => {
    const { project } = props;
    const { onDelete } = props;

    const [id] = useState(project.id);
    const [name] = useState(project.name);
    const [site] = useState(project.site);

    const [pilot] = useState(project.pilot);
    const [begin] = useState(mom.dateTime(project.begin).format(DATETIME_DEFAULTFORMAT));
    const [end] = useState(mom.dateTime(project.end).format(DATETIME_DEFAULTFORMAT));
    const [created] = useState(mom.dateTime(project.created).format(DATETIME_DEFAULTFORMAT));
    const [updated] = useState(mom.dateTime(project.updated).format(DATETIME_DEFAULTFORMAT));

    const [comment] = useState(project.comment);

    return (
        <div>
            <ControlBar id={id} onDelete={onDelete}/>
            <div className="caption"><i className="fa fa-info-circle"/> Project Basic Information</div>
            <div className="project-basic-info" key="project-basic-info">
                <ProjectTitle value={name} />
                <ProjectSite value={site} />
                <ProjectPilot value={pilot} />
                <ProjectFlightTime begin={begin} end={end} />
                <ProjectRepoTime created={created} updated={updated} />
                <ProjectGeoPoint value={`35.019942,126.78103,17z`} />
                <ProjectComment value={comment} />
            </div>
        </div>
    );
  };

  const ControlBar = (props: any) => {
    const { id, onDelete } = props;
    return (
      <div className="row control-bar">
        <button className="width-10 fa fa-remove btn btn-secondary gf-form-btn" onClick={(e)=>onDelete({id})}> 프로젝트 삭제</button>
        <button className="width-10 fa fa-list-alt btn btn-secondary gf-form-btn" onClick={ (e) => history.back() }> 목록보기</button>
      </div>
    );
  };

  const ProjectTitle = (props: any) => {
    const { value } = props;
    return (
        <div className="row"><span className="cell title">프로젝트명</span><span className="cell primary project-title">{value}</span></div>
    );
  };

  const ProjectSite = (props: any) => {
    const { value } = props;
    return (
        <div className="row"><span className="cell title">싸이트</span><span className="cell primary project-site">{value}</span></div>
    );
  };

  const ProjectPilot = (props: any) => {
    const { value } = props;
    return (
      <div className="row"><span className="cell title">파일럿</span><span className="cell primary project-pilot">{value}</span></div>
    );
  };

  const ProjectComment = (props: any) => {
    const { value } = props;
    const [comment, writeComment] = useState(value);
    return (
        <div className="row"><span className="cell title">판단이력</span><span className="cell primary project-comment">
            <input className="project-comment"
                type="text"
                height="250px"
                max-width="960px"
                value={comment}
                onChange={event => writeComment(event.target.value)}
            />
        </span></div>
    );
  };

  const ProjectFlightTime = (props: any) => {
    const { begin, end } = props;
    return (
        <div className="row"><span className="cell title">촬영시간</span><span className="cell primary project-flight-time">{begin} ~ {end}</span></div>
    );
  };
  const ProjectRepoTime = (props: any) => {
    const { created, updated } = props;
    return (
      <div className="row"><span className="cell title">관리시간</span><span className="cell primary project-repo-time">{created} ~ {updated}</span></div>
    );
  };

  const ProjectGeoPoint = (props: any) => {
    const { value } = props;
    return (
      <div className="row"><span className="cell title">위치</span><span className="cell primary geo-point">{value}</span></div>
    );
  };

const mapDispatchToProps = {
    loadProject,
};

const mapStateToProps = (state: ProjectInfoState) => ({
    project: state.project,
});

export default connectWithStore(ProjectInfo, mapStateToProps, mapDispatchToProps);
