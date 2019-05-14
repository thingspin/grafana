import React, { PureComponent, useState } from 'react';

import { appEvents } from 'app/core/core';
import { getBackendSrv } from 'app/core/services/backend_srv';
//import { dateTime } from '@grafana/ui/src/utils/moment_wrapper';

import { Project } from '../types';

export interface PropsAddProject {
  title?: string;
  onCancel?: () => void;
  onSave?: (e) => void;
  onWarnning?: (t: any, m: any) => void;
}

export class ProjectInfoEditor extends PureComponent<PropsAddProject, Project> {
  state: Project = {
    id: "",
    name: "새 프로젝트",
    site: "새 사이트",
    pilot: "파일럿",
    begin: new Date(),
    end: new Date(),
  };

  onSave = () => {
    const {onWarnning} = this.props;
    const {name, site } = this.state;

    if ( name === "새 프로젝트") {
      onWarnning(name, `프로젝트 이름을 입력 하세요.`);
      return;
    }

    if ( site === "새 사이트") {
      onWarnning(site, `대상물/발전소이름을 입력 하세요.`);
      return;
    }

    appEvents.emit('confirm-modal', {
      title: '프로젝트 생성',
      text: '드론으로 촬영한 영상과 문제점 분석을 위해 프로젝트를 생성합니다.',
      text2: '프로젝트 생성 후 실영상/영화상 사진 및 동영상을 저작한 폴더와 3D 맵을 생성한 폴더를 지정 하셔야 합니다.',
      altActionText: '보류',
      icon: 'fa-superpowers',
      onConfirm: () => {
        getBackendSrv().put(`api/drone/project/`, this.state).then( (result) => {
          console.log(result);
          this.props.onSave(this.state);
        });
      },
      onAltAction: () => {
      },
    });
  };

  onCancel = () => {
    this.props.onCancel();
  };

  onChangeName = (data) => {
    this.setState( { name: data });
  };

  onChangeSite = (data) => {
    this.setState( { site: data });
  };

  onChangePilot = (data) => {
    this.setState( { pilot: data });
  };

  onChangeComment = (data) => {
    this.setState( { comment: data });
  };

  onChangeFlightTime = (begin, end) => {
    this.setState( { begin: begin, end: end });
  };

  render() {
    return (<div className="gf-form-group project-basic-info-editor">
      <div className="items">
        <ProjectTitleEditor value={this.state.name} onChange={this.onChangeName.bind(this)}/>
        <ProjectSiteEditor value={this.state.site} onChange={this.onChangeSite.bind(this)}/>
        <ProjectPilotEditor value={this.state.pilot} onChange={this.onChangePilot.bind(this)}/>
        <ProjectPilotTimeEditor begin={this.state.begin} end={this.state.end} onChange={this.onChangeFlightTime.bind(this)}/>
      </div>
      <div className="actions">
        <ProjectSaveButton data={this.state} onSave={this.onSave} onCancel={this.onCancel}/>
      </div>
    </div>);
  }
}

const ProjectTitleEditor = (props) => {
  const { value, onChange } = props;
  const [ title, changeValue ] = useState(value);
  return (<div className="gf-form">
    <label className="gf-form-label width-7">프로젝트명</label>
    <input type="text" className="gf-form-input width-30"
      value={title}
      placeholder="프로젝트 이름"
      onChange={ (e) => {
        changeValue(e.target.value);
        onChange(e.target.value);
      }}>
    </input>
  </div>);
};

const ProjectSiteEditor = (props) => {
  const { value, onChange } = props;
  const [ site, changeValue] = useState(value);
  return (<div className="gf-form">
    <label className="gf-form-label width-7">발전소(장소)</label>
    <input type="text" className="gf-form-input width-30"
      value={site}
      placeholder="발전소(장소)"
      onChange={ (e) => {
        changeValue(e.target.value);
        onChange(e.target.value);
      }}>
    </input>
  </div>);
};

const ProjectPilotEditor = (props) => {
  const { value, onChange } = props;
  const [ pilot, changeValue] = useState(value);
  return (<div className="gf-form">
    <label className="gf-form-label width-7">촬영자</label>
    <input type="text" className="gf-form-input width-15"
      value={pilot}
      placeholder={pilot}
      onChange={ (e) => {
        changeValue(e.target.value);
        onChange(e.target.value);
      }}>
    </input>
  </div>);
};

const ProjectPilotTimeEditor = (props) => {
  const { begin, end, onChange } = props;
  const [ begineDate, writeBegineDate] = useState(begin);
  const [ endDate, writeEndDate] = useState(end);
  return (
    <div className="gf-form">
      <label className="gf-form-label width-7">촬영시간</label>
      <input type="datetime-local" className="gf-form-input width-15"
        value={begineDate}
        onChange={e => {
          writeBegineDate(e.target.value);
          onChange(e.target.value, endDate);
        }}>
      </input>
      <input type="datetime-local" className="gf-form-input width-15"
        value={endDate}
        onChange={e => {
          writeEndDate(e.target.value);
          onChange(begineDate, e.target.value);
        }}>
      </input>
    </div>
  );
};

const ProjectSaveButton = (props) => {
  const { onSave, onCancel } = props;
  return (<div className="action">
    <button className="width-10 fa fa-list btn btn-secondary gf-form-btn" onClick={onCancel}> 취소</button>
    <button className="width-10 fa fa-save btn btn-secondary gf-form-btn" onClick={onSave}> 저장</button>
    </div>
  );
};
