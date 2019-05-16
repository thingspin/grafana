// npm libraries
import React, { PureComponent } from 'react';

// Grafana Libraries
import { Tooltip } from '@grafana/ui';
import { updateLocation } from 'app/core/actions';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { appEvents } from 'app/core/app_events';

// ThingSPIN libraries
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import TsNavSearchComponent from './SearchButton';
import TsUserSettingButtonComponent from './UserSettingButton/index';
import TsViewModeButtonComponent from './ViewModeButton/index';
import { TsNavbarPayload } from 'app-thingspin-fms/react/redux/reducers/navbar';

export interface Props extends TsBaseProps {
  updateLocation: typeof updateLocation;
  navbar: TsNavbarPayload;
}

export class TsRightNavbarComponent extends PureComponent<Props> {
  // private class member variables

  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
  }

  // common event Methods

  // get render splitted virtual DOM Methods

  get renderSearchButton(): JSX.Element {
    return <TsNavSearchComponent {...this.props} />;
  }

  get renderDivider(): JSX.Element {
    return <div className="ts-nav-divider" />;
  }

  get renderAlertButton(): JSX.Element {
    // Virtual DOM Private Variables
    const { isEmergency }: TsNavbarPayload = this.props.navbar;
    const tooltip = '긴급 알람 이력 보기';
    const buttonClass = `btn ${isEmergency ? 'ts-alert-emer' : ''}`;
    // Virtual DOM events Methods
    const onToggleRightMenu = () => {
      this.props.updateLocation({ path: '/thingspin/manage/alarm' });
    };

    // return virtual DOM
    return (
      <div className="navbar-buttons--tv">
        <Tooltip content={tooltip} placement="bottom">
          <button className={buttonClass} onClick={onToggleRightMenu}>
            <i className={'fa fa-bell'} />
          </button>
        </Tooltip>
      </div>
    );
  }

  get renderRightSidebarButton(): JSX.Element {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods
    const onToggleVSplitMode = () => {
      appEvents.emit('toggle-right-sidebar');
    };
    const { enableRightSidebarButton } = this.props.navbar;
    const icon = enableRightSidebarButton ? 'fa-caret-square-o-left' : 'fa-caret-square-o-right';
    const tooltip = `오른쪽 디스플레이 창 ${enableRightSidebarButton ? '열기' : '닫기'}`;

    // return virtual DOM
    return (
      <div className="navbar-buttons--tv">
        <Tooltip content={tooltip} placement="bottom">
          <button className={`btn`} onClick={onToggleVSplitMode}>
            <i className={`fa ${icon}`} />
          </button>
        </Tooltip>
      </div>
    );
  }

  get renderViewModeButton(): JSX.Element {
    return <TsViewModeButtonComponent {...this.props} />;
  }

  get renderUserSettingButton(): JSX.Element {
    return <TsUserSettingButtonComponent />;
  }

  // Component lifeCycle Methods

  // render 함수 호출 전 실행 함수
  // componentWillMount() {}
  // Virtual DOM을 HTML에 Rendering
  render() {
    const { enableAlertButton, enableSearchButton, enableUserSettingButton, enableViewModeButton } = this.props.navbar;

    return (
      <div className="ts-right-navbar">
        {enableSearchButton ? this.renderSearchButton : null}
        {this.renderDivider}
        {enableAlertButton ? this.renderAlertButton : null}
        {enableViewModeButton ? this.renderViewModeButton : null}
        {enableUserSettingButton ? this.renderUserSettingButton : null}
        {this.renderRightSidebarButton}
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

const mapStateToProps = state => ({
  navbar: state.thingspinNavbar,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsRightNavbarComponent, mapStateToProps, mapDispatchToProps);
