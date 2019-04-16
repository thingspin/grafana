import React, { PureComponent } from 'react';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// import { StoreState } from 'app/types';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

import { savePinState } from './pinMenu';
import { notifyApp } from 'app/core/actions';
import { createSuccessNotification } from 'app/core/copy/appNotification';

import TsMenuLv2 from './MenuLv2';

export interface Props extends TsBaseProps {
  menu: any;
  pinned: boolean;
  savePinState: typeof savePinState;
  notifyApp: typeof notifyApp;
}

interface State {
  open: boolean;
  maxChild: number;
  pin: boolean;
}

class TsMenuLv1 extends PureComponent<Props, State> {
  state: State = {
    open: this.props.pinned,
    maxChild: 8,
    pin: this.props.pinned,
  };

  componentWillMount() {
    const { pinned } = this.props;
    this.setState( {
      pin: pinned,
      open: pinned
    });
  }
  async componentDidMount() {

  }
  componentWillUnmount() {}
  componentDidUpdate(prevProps: Props) {}

  arrowClickEvt = () => {
    const { open } = this.state;
    const pin = open ? false : this.state.pin;

    this.setState({
      open: !open,
      pin,
    });
  };

  pinClickEvt = () => {
    const { menu } = this.props;
    this.props.savePinState({
      menuID: menu.id,
      Pinned: !this.state.pin
    });
    this.setState({ pin: !this.state.pin });
    this.props.notifyApp(createSuccessNotification(`메뉴`, this.state.pin ? `메뉴를 닫아 둡니다.` : `메뉴를 열어 둡니다.`));
  };

  get arrowDOM() {
    const { menu } = this.props, { pin, open } = this.state;
    const { pinned } = this.props;
    const arrowIcon = (pinned || open) ? 'fa fa-caret-down' : 'fa fa-caret-up';

    return (
      <div className="fms-menu-header-controls-arrow" onClick={this.arrowClickEvt}>
        <span>
          <i className={menu.children ? (pin ? null : arrowIcon) : null} />
        </span>
      </div>
    );
  }

  get pinDOM() {
    const { open, pin } = this.state;
    const { pinned } = this.props;
    const pinIcon = (pinned || pin) ? 'ts-leftsidebar-icons ts-left-icon-pin-on' : 'ts-leftsidebar-icons ts-left-icon-pin-off';

    return (pinned || open) ? (
      <div className="fms-menu-header-controls-pin" onClick={this.pinClickEvt}>
        <span>
          <i className={pinIcon} />
        </span>
      </div>
    ) : null;
  }

  get childrenDOM() {
    const { menu, pinned } = this.props, { maxChild, open } = this.state;

    const bodyStyle =
      menu.children && menu.children.length >= maxChild
        ? {
            height: `${maxChild * 28}px`,
          }
        : {};

    const DOM = menu.children ? (
      <div key="menulv2" className="fms-menu-body" style={bodyStyle}>
        {' '}
        {menu.children
          .filter(item => !item.hideFromMenu)
          .filter(item => !item.divider)
          .map((item, idx) => (
            <TsMenuLv2 key={idx} menu={item} />
          ))}{' '}
      </div>
    ) : null;

    return (pinned || open) ? DOM : null;
  }

  render() {
    const { menu } = this.props;
    return [
      <div className="fms-menu-lv1" key="ts-menu-lv1">
        <div className="fms-menu-header" key="menulv1">
          <div className="fms-menu-header-icon">
            <i className={menu.icon} />
          </div>
          <div className="fms-menu-header-name">
            <a href={menu.url} target={menu.target}>
              {menu.text}
            </a>
          </div>
          <div className="fms-menu-header-controls">
            {this.pinDOM}
            {this.arrowDOM}
          </div>
        </div>
        {this.childrenDOM}
      </div>,
      <div className="fms-menu-dividers" key="ts-dividers">
        <hr className="fms-menu-dividers-divider" key="ts-divider" />
      </div>,
    ];
  }
}

const mapDispatchToProps = {
  savePinState,
  notifyApp,
};

const mapStateToProps = () => ({});

export default connectWithStore(TsMenuLv1, mapStateToProps, mapDispatchToProps);

// export default hot(module)(connect(mapStateToProps,mapDispatchToProps)(TsMenuLv1));
