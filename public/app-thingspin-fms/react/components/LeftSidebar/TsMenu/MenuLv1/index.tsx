import React, { PureComponent } from 'react';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// import { StoreState } from 'app/types';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

import { savePinState, getUserPins } from './pinMenu';
import { notifyApp } from 'app/core/actions';
import { createSuccessNotification } from 'app/core/copy/appNotification';

import TsMenuLv2 from './MenuLv2';

export interface Props extends TsBaseProps {
  menu: any;
  pinned: boolean;
  savePinState: typeof savePinState;
  getUserPins: typeof getUserPins;
  notifyApp: typeof notifyApp;
}

interface State {
  open: boolean;
  pin: boolean;
}

class TsMenuLv1 extends PureComponent<Props, State> {
  state: State = {
    open: this.props.pinned,
    pin: this.props.pinned,
  };

  async UNSAFE_componentWillMount() {
    const { menu, getUserPins } = this.props;
    const pins: any = await getUserPins();

    if (Array.isArray(pins)
      && pins.filter((pin) => pin === menu.id).length) {
      this.setState({
        pin: true,
        open: true,
      });
    }
  }

  arrowClickEvt = () => {
    const { open, pin } = this.state;

    this.setState({
      open: !open,
      pin: open ? false : pin,
    });
  };

  pinClickEvt = () => {
    const { pin } = this.state;
    const { menu: { id }, savePinState, notifyApp} = this.props;

    savePinState({
      menuID: id,
      Pinned: !pin,
    });
    this.setState({ pin: !pin });

    notifyApp(createSuccessNotification(`메뉴`, pin ? `메뉴를 닫아 둡니다.` : `메뉴를 열어 둡니다.`));
  };

  get arrowDOM() {
    const { menu } = this.props;
    const { pin, open } = this.state;
    const arrowIcon = (pin || open) ? 'fa fa-caret-down' : 'fa fa-caret-up';

    return (pin || menu.children.length === 0) ? null : (
        <div className="fms-menu-header-controls-arrow" onClick={this.arrowClickEvt}>
          <span>
            <i className={arrowIcon} />
          </span>
        </div>
    );
    /*
    return <div className="fms-menu-header-controls-arrow" onClick={this.arrowClickEvt}>
      <span>
        <i className={menu.children ? (pin ? null : arrowIcon) : null} />
      </span>
    </div>;
    */
  }

  get pinDOM() {
    const { open, pin } = this.state;
    const pinIcon = `ts-leftsidebar-icons ${pin ? 'ts-left-icon-pin-on' : 'ts-left-icon-pin-off'}`;

    return (pin || open) ? (
      <div className="fms-menu-header-controls-pin" onClick={this.pinClickEvt}>
        <span>
          <i className={pinIcon} />
        </span>
      </div>
    ) : null;
  }

  get childrenDOM() {
    const { menu: { children } } = this.props;
    const { open, pin } = this.state;

    const DOM = children ? (
      <div key="menulv2" className="fms-menu-body" /*style={bodyStyle}*/>
        {' '}
        {children
          .filter(({ hideFromMenu, divider }: any) => !hideFromMenu && !divider)
          .map((item: any, idx: number) => (<TsMenuLv2 key={idx} menu={item} />))
        }{' '}
      </div>
    ) : null;

    return (pin || open) ? DOM : null;
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
    ];
  }
}

const mapDispatchToProps = {
  savePinState,
  getUserPins,
  notifyApp,
};

const mapStateToProps = () => ({});

export default connectWithStore(TsMenuLv1, mapStateToProps, mapDispatchToProps);
