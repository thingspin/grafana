import React, { PureComponent } from 'react';

import { appEvents } from 'app/core/core';
import { Tooltip } from '@grafana/ui';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

import { TsBaseProps } from 'app-thingspin-fms/models/common';

export interface Props extends TsBaseProps {
  kiosk: any;
}

export class TsViewModeButtonCompoent extends PureComponent<Props> {
  // private class member variables
  private currentNubmer: number;
  // public class member variables
  // protected class member variables

  constructor(props) {
    super(props);
  }

  getViewmodeIcon(num: number) {
    let faIcon: string;
    switch (num) {
      case 1:
        faIcon = 'fa-desktop';
        break;
      case 2:
        faIcon = 'fa-television';
        break;
      default:
        // view mode 0
        faIcon = 'fa-laptop';
        break;
    }
    return faIcon;
  }

  renderViewMode(num: number): JSX.Element {
    // Virtual DOM Private Variables
    const icon = this.getViewmodeIcon(num);
    // Virtual DOM events Methods
    const updateViewMode = () => {
      appEvents.emit('ts-change-viewmode', num);
    };

    // return virtual DOM
    return (
      <div className="ts-user-setting-child-menu">
        <Tooltip content={`뷰 모드 ${num}`} placement="bottom">
          <a className={`btn ${this.currentNubmer === num ? 'enable' : null}`} href="#" onClick={updateViewMode}>
            <i className={`fa ${icon}`} />
          </a>
        </Tooltip>
      </div>
    );
  }

  get renderTooltip(): JSX.Element {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods

    // return virtual DOM
    return (
      <div className="ts-user-setting-menu">
        {this.renderViewMode(0)}
        {this.renderViewMode(1)}
        {this.renderViewMode(2)}
      </div>
    );
  }

  render() {
    // Virtual DOM Private Variables

    // Virtual DOM events Methods
    const onToggleViewMode = () => {
      appEvents.emit('toggle-kiosk-mode');
    };

    let faIcon: string;
    switch (this.props.kiosk) {
      case '1':
      case true: //view mode 2
        this.currentNubmer = 2;
        break;
      case 'tv': //view mode 1
        faIcon = 'fa-television';
        this.currentNubmer = 1;
        break;
      default:
        // view mode 0
        this.currentNubmer = 0;
        faIcon = 'fa-desktop';
        break;
    }

    // return virtual DOM
    return (
      <div className="navbar-buttons--tv">
        <Tooltip content={this.renderTooltip} placement="bottom">
          <button className={`btn`} onClick={onToggleViewMode}>
            <i className={`fa ${faIcon}`} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // render 함수 호출 후 실행 함수
  // componentDidMount() {}
  // prop을 새로 받았을 때 실행 함수
  // componentWillReceiveProps() {}
  // prop or state 변경시 재렌더링 여부 결정 함수
  // shouldComponentUpdate() {}
  // 컴포넌트 업데이트(재렌더링) 전 실행 함수
  // componentWillUpdate() {}
  // 컴포넌트 재렌더링 후 실행 함수
  // componentDidUpdate() {}
  // DOM에 재거 후 실행 함수
  // componentWillUnmount() {}
}

const mapStateToProps = (state: any) => ({
  kiosk: state.thingspinNavbar.kiosk,
});

const mapDispatchToProps = {};

export default connectWithStore(TsViewModeButtonCompoent, mapStateToProps, mapDispatchToProps);
