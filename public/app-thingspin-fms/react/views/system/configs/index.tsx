//import React, { useState } from 'react';
import React, { PureComponent } from 'react';

export interface Props {
  section: any;
}

export interface PropsItems {
  items: any;
}

export interface States {}

// function SampleCounter () {
//   const [count, setCount] = useState(0);

//   return (
//     <div>
//       <h1>{count}</h1>
//       <button onClick={ () => setCount( count + 1) }>Count Up!</button>
//     </div>
//   );
// }
enum ConfigSectionEnum {
  License = 'license',
  ContentsDirectory = 'contents',
  ServiceDeamon = 'service',
  APIKeys = 'apikeys',
}

class ConfigItem extends PureComponent<PropsItems, States> {
  render () {
    return (
      this.props.items.map ( (item: any, index: number) => {
        return (
          <div className="item">
            <div>{item.attribute} : {item.value}</div>
          </div>
        );
      })
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

  get items(): JSX.Element {
    const items = [];
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

    return items.map( (item, index) => {
       return (<ConfigItem key={index} items={items} />);
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
        { this.items }
      </div>
    ]
    );
  }

  get items(): JSX.Element {
    const { sections } = this.states;

    return sections.map( (item: any, index: number) => {
        return (
          <ConfigSection key={index} section={item}/>
        );
    });
  }
}

