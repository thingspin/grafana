//import React, { useState } from 'react';
import React, { PureComponent } from 'react';

enum ConfigSectionEnum {
  License = 'license',
  ContentsDirectory = 'contents',
  ServiceDeamon = 'service',
  APIKeys = 'apikeys',
}

interface Section {
  key: ConfigSectionEnum;
  name: string;
}

interface Item {
  attribute: string;
  value: any;
}

export interface Props {
  section: any;
}

export interface PropsItems {
  item: Item;
}

export interface States {}

class ConfigItem extends PureComponent<PropsItems, States> {
  render () {
    return (
          <div className="item">
            <div>{this.props.item.attribute} : {this.props.item.value}</div>
          </div>
    );
  }
}

class ConfigSection extends PureComponent<Props, States> {
  render() {
    return (
      <div className="config-section" key={'config-section' + this.props.section.name}>
        <div className="title" key={'title' + this.props.section.key}><span><i className="fa fw fa-cog"></i></span> {this.props.section.name}</div>
        { this.items }
      </div>
    );
  }

  get items(): JSX.Element[] {
    const items: Item[] = [];
    const { section } = this.props;

    switch ( section.key ) {
      case ConfigSectionEnum.APIKeys : {
        items.push({ attribute: "현재 발행 수", value: 0});
        items.push({ attribute: "최대 발행 수", value: 50});
      }
      break;
      case ConfigSectionEnum.License : {
        items.push({ attribute: "현재 라이센스", value: "무제한"});
        items.push({ attribute: "라이선스 갱신", value: "<span><i fa fw fa-cog></i></span>"});
      }
      break;
      case ConfigSectionEnum.ServiceDeamon : {
        items.push({ attribute: "노드레드", value: "동장 중"});
        items.push({ attribute: "MQTT 브로커", value: "동장 중"});
      }
      break;
      case ConfigSectionEnum.ContentsDirectory : {
        items.push({ attribute: "현재 발행 수", value: "0"});
        items.push({ attribute: "최대 발행 수", value: "50"});
      }
      break;
    }

    return items.map( (item: Item) => {
       return (<ConfigItem item={item} />);
    });

  }
}

export class TsConfigs extends PureComponent<Props, States> {
  states = {
    sections: [
      { key: ConfigSectionEnum.License, name: "라이선스"},
      { key: ConfigSectionEnum.ContentsDirectory, name: "콘텐츠 디렉토리"},
      { key: ConfigSectionEnum.ServiceDeamon, name: "서비스 데몬"},
      { key: ConfigSectionEnum.APIKeys, name: "API 및 접속키"},
    ]
  };
  render() {
    return ([
      <div className="grafana-info-box" key="info-box-1">
        <p>시스템 관리자를 위한 기능입니다.</p>
      </div>,
      <div className="config-sections" key="config-sections-1">
        { this.sections }
      </div>
    ]
    );
  }

  get sections(): JSX.Element[] {
    const { sections } = this.states;

    return sections.map((section: Section) => {
        return (
          <ConfigSection key={section.key} section={section}/>
        );
    });
  }
}

