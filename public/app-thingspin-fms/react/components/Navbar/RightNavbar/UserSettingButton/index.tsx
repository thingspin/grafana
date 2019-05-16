import React, { PureComponent } from 'react';

// State
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { updateLocation } from 'app/core/actions';

import { Tooltip } from '@grafana/ui';

import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { contextSrv } from 'app/core/core';

export interface Props extends TsBaseProps {
  updateLocation: typeof updateLocation;
}

export interface States {
  isGrafanaAdmin: boolean;
}

export class TsUserSettingButtonComponent extends PureComponent<Props, States> {
  constructor(props) {
    super(props);

    const { isGrafanaAdmin } = contextSrv.user;
    this.state = {
      isGrafanaAdmin,
    };
  }

  get userSettingPage(): JSX.Element {
    // Virtual DOM events Methods
    const onGotoUserSettingPage = () => {
      this.props.updateLocation({ path: '/thingspin/user/profile' });
    };

    // return virtual DOM
    return (
      <div className="ts-user-setting-child-menu">
        <Tooltip content={'사용자 설정 페이지'} placement="bottom">
          <button className={`btn`} onClick={onGotoUserSettingPage}>
            <i className={'fa fa-user'} />
          </button>
        </Tooltip>
      </div>
    );
  }
  get systemSettingPage(): JSX.Element {
    // Virtual DOM events Methods
    const onGotoSystemSettingPage = () => {
      this.props.updateLocation({ path: '/admin/settings' });
    };

    // return virtual DOM
    return (
      <div className="ts-user-setting-child-menu">
        <Tooltip content={'시스템 설정 페이지'} placement="bottom">
          <button className={`btn`} onClick={onGotoSystemSettingPage}>
            <i className={'fa fa-gears'} />
          </button>
        </Tooltip>
      </div>
    );
  }

  get userLogout(): JSX.Element {
    return (
      <div className="ts-user-setting-child-menu">
        <Tooltip content={'사용자 로그 아웃'} placement="bottom">
          <a className={`btn`} target={'_self'} href="/logout">
            <i className={'fa fa-sign-out'} />
          </a>
        </Tooltip>
      </div>
    );
  }

  get tooltip(): JSX.Element {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods

    // return virtual DOM
    return (
      <div className="ts-user-setting-menu">
        {true ? null : this.systemSettingPage}
        {this.state.isGrafanaAdmin ? this.userSettingPage : null}
        {this.userLogout}
      </div>
    );
  }

  render() {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods

    // return virtual DOM
    return (
      <div className="ts-user-setting-button-component navbar-buttons--tv">
        <Tooltip content={this.tooltip} placement="bottom">
          <button className={`btn`}>
            <i className={'fa fa-user-circle'} />
          </button>
        </Tooltip>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsUserSettingButtonComponent, mapStateToProps, mapDispatchToProps);
