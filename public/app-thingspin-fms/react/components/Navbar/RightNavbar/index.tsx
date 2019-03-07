// npm libraries
import React, { PureComponent } from 'react';

// Grafana Libraries
import { Tooltip } from '@grafana/ui';
import { DashNav } from 'app/features/dashboard/components/DashNav/DashNav';
import { updateLocation } from 'app/core/actions';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// ThingSPIN libraries
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { TsSearchButtonComponent } from './SearchButton';
import TsUserSettingButtonComponent from './UserSettingButton/index';

export interface Props extends TsBaseProps {
  updateLocation: typeof updateLocation;
}

export interface States {
  isEmergency: boolean;
  enableAlertButton: boolean;
  enableViewModeButton: boolean;
  enableUserSettingButton: boolean;
  enableSearchButton: boolean;
}

export class TsRightNavbarComponent extends PureComponent<Props, States> {
  // private class member variables
  gfNav: DashNav; // has-a inheritance relation
  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
    this.gfNav = new DashNav(props);

    this.state = {
      isEmergency: false,
      enableSearchButton: true,
      enableAlertButton: true,
      enableViewModeButton: true,
      enableUserSettingButton: true,
    };
  }

  // common event Methods

  // get render splitted virtual DOM Methods

  get renderSearchButton(): JSX.Element {
    return <TsSearchButtonComponent {...this.props} />;
  }

  get renderDivider(): JSX.Element {
    return <div className="ts-nav-divider" />;
  }

  get renderAlertButton(): JSX.Element {
    // Virtual DOM Private Variables
    const { isEmergency } = this.state;
    const tooltip = '긴급 알람 이력 보기';
    const buttonClass = `btn navbar-button--tv ${isEmergency ? 'ts-alert-emer' : ''}`;
    // Virtual DOM events Methods
    const onToggleRightMenu = () => {
      this.props.updateLocation({ path: '/alarm' });
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

  get renderViewModeButton(): JSX.Element {
    // Virtual DOM Private Variables
    const tooltip = '뷰 모드 전환';
    // Virtual DOM events Methods
    const onToggleViewMode = () => {
      this.gfNav.onToggleTVMode();
    };

    // return virtual DOM
    return (
      <div className="navbar-buttons--tv">
        <Tooltip content={tooltip} placement="bottom">
          <button className={`btn navbar-button--tv`} onClick={onToggleViewMode}>
            <i className={'fa fa-desktop'} />
          </button>
        </Tooltip>
      </div>
    );
  }

  get renderUserSettingButton(): JSX.Element {
    return <TsUserSettingButtonComponent />;
  }

  // Component lifeCycle Methods

  // render 함수 호출 전 실행 함수
  // componentWillMount() {}
  // Virtual DOM을 HTML에 Rendering
  render() {
    const { enableAlertButton, enableSearchButton, enableUserSettingButton, enableViewModeButton } = this.state;

    return (
      <div className="ts-right-navbar">
        {enableSearchButton ? this.renderSearchButton : null}
        {this.renderDivider}
        {enableAlertButton ? this.renderAlertButton : null}
        {enableViewModeButton ? this.renderViewModeButton : null}
        {enableUserSettingButton ? this.renderUserSettingButton : null}
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
  componentWillUnmount() {
    this.gfNav.componentWillUnmount();
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsRightNavbarComponent, mapStateToProps, mapDispatchToProps);
