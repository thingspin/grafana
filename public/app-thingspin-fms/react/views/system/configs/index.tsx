import React, { PureComponent } from 'react';
import * as m from './types';

import { ContentsDirectory } from './contentsDirectory';
import { SystemControl } from './systemControl';
import { UnderConstruction } from './todo';

//=================================================================================================
export class TsConfigs extends PureComponent<m.Props, m.StatesConfig> {
  prepaired: m.Section[] = [
    { key: m.ConfigSectionEnum.ContentsDirectory, name: "콘텐츠 디렉토리"},
    { key: m.ConfigSectionEnum.License, name: "라이선스"},
    { key: m.ConfigSectionEnum.ServiceDeamon, name: "서비스 데몬"},
    { key: m.ConfigSectionEnum.API, name: "API 및 접속키"},
    { key: m.ConfigSectionEnum.Control, name: "동작"},
  ];

  state: m.StatesConfig = {
    mode: "all",
    solo: false,
    sections: []
  };

  constructor(props) {
    super(props);
    const { $route } = props;

    if ( $route.current.params.mode !== undefined ) {
      const { mode } = $route.current.params;
      if (Object.values(m.ConfigSectionEnum).includes(mode)) {
        this.state.mode = mode;
      }
    }
  }

  async componentWillMount() {
    const { mode } = this.state;
    if ( mode === "all" ) {
        this.setState({sections: this.prepaired, solo: false});
    } else {
      const section = this.prepaired.find(section => section.key === mode);
      this.setState({sections: [section], solo: true});
    }
  }

  render() {
    const { solo } = this.state;
    const className = "config-sections" + ( solo ? " solo" : "");
    return ([
      <div className="grafana-info-box" key="info-box-1">
        <p>시스템 관리자를 위한 기능입니다.</p>
      </div>,
      <div className={className} key="config-sections-1">
        { this.sections }
      </div>,
      // <div className="config-footer" key="footer-box-1"></div>
    ]
    );
  }

  get sections(): JSX.Element[] {
    const { sections, solo } = this.state;
    return sections.map((section: m.Section) => {
        return (
          <ConfigSection key={section.key} solo={solo} section={section}/>
        );
    });
  }
}

//=================================================================================================
class ConfigSection extends PureComponent<m.PropsSection, m.StatesSection> {
  render() {
    const { solo } = this.props;
    const className = "config-section" + ( solo ? " solo" : "");

    return (
      <div className={className} key={'config-section' + this.props.section.name}>
        <div className="title" key={'title' + this.props.section.key}><span><i className="fa fw fa-cog"></i></span> {this.props.section.name}</div>
        { this.items }
      </div>
    );
  }

  get items(): JSX.Element[] {
    const items: m.Item[] = [];
    const { section } = this.props;

    switch ( section.key ) {

      case m.ConfigSectionEnum.ContentsDirectory : {
        items.push({ attribute: "기본 컨텐츠 폴더", tag: "basic-data-folder"});
        items.push({ attribute: "갤러리 폴더", tag: "gallery-data-folder"});
        items.push({ attribute: "드론 데이터 폴더", tag: "drone-data-folder"});
        items.push({ attribute: "3D 맵퍼 폴더", tag: "drone-3d-data-folder"});
      }
      break;

      case m.ConfigSectionEnum.API : {
        items.push({ attribute: "상태", tag: "*UNDER CONSTRUCT*", devel: true});
      }
      break;
      case m.ConfigSectionEnum.License : {
        items.push({ attribute: "상태", tag: "*UNDER CONSTRUCT*", devel: true});
      }
      break;
      case m.ConfigSectionEnum.ServiceDeamon : {
        items.push({ attribute: "상태", tag: "*UNDER CONSTRUCT*", devel: true});
      }
      break;
      case m.ConfigSectionEnum.Control : {
        items.push({ attribute: "재시작", tag: "control-restart",});
      }
      break;
    }

    return items.map( (item: m.Item) => {
       return (<ConfigItem section={section} item={item} key={item.attribute}/>);
    });
  }
}

//=================================================================================================
class ConfigItem extends PureComponent<m.PropsItems, m.StatesItems> {
  render () {
    const { section, item } = this.props;
    switch ( section.key ) {
      case m.ConfigSectionEnum.ContentsDirectory : {
        return (
          <div className="item">
            {<ContentsDirectory item={item} key={section.key + "." + item.tag}/>}
          </div>
        );
      }
      break;
      case m.ConfigSectionEnum.Control : {
        return (
          <div className="item">
            {<SystemControl item={item} key={section.key + "." + item.tag}/>}
          </div>
        );
      }
      break;
    }

    return (
          <div className="item devel">
            {<UnderConstruction/>}
          </div>
    );
  }
}

//=================================================================================================
