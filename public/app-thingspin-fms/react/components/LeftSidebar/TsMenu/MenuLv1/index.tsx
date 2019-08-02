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
  maxChild: number;
  pin: boolean;
}

class TsMenuLv1 extends PureComponent<Props, State> {
  state: State = {
    open: this.props.pinned,
    maxChild: 8,
    pin: this.props.pinned,
  };
  pins: any;
  async componentWillMount() {
    this.pins = await this.props.getUserPins();
    const { menu } = this.props;
    if ( this.pins !== null) {
      for ( let _i = 0; _i < this.pins.length; _i++) {
        if ( this.pins[_i] === menu.id) {
          this.setState( {
            pin: true,
            open: true
          });
          break;
        }
      }
    }
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
    //const { pinned } = this.props;
    const arrowIcon = (pin || open) ? 'fa fa-caret-down' : 'fa fa-caret-up';

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
    //const { pinned } = this.props;
    const pinIcon = (pin) ? 'ts-leftsidebar-icons ts-left-icon-pin-on' : 'ts-leftsidebar-icons ts-left-icon-pin-off';

    return (pin || open) ? (
      <div className="fms-menu-header-controls-pin" onClick={this.pinClickEvt}>
        <span>
          <i className={pinIcon} />
        </span>
      </div>
    ) : null;
  }

  get childrenDOM() {
    const { menu } = this.props, { /*maxChild,*/ open, pin } = this.state;

    // const bodyStyle =
    //   menu.children && menu.children.length >= maxChild
    //     ? {
    //         height: `${maxChild * 28}px`,
    //       }
    //     : {};

    const DOM = menu.children ? (
      <div key="menulv2" className="fms-menu-body" /*style={bodyStyle}*/>
        {' '}
        {menu.children
          .filter((item: any) => !item.hideFromMenu)
          .filter((item: any) => !item.divider)
          .map((item: any, idx: number) => (
            <TsMenuLv2 key={idx} menu={item} />
          ))}{' '}
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
      <div className="fms-menu-dividers" key="ts-dividers">
        <hr className="fms-menu-dividers-divider" key="ts-divider" />
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

// export default hot(module)(connect(mapStateToProps,mapDispatchToProps)(TsMenuLv1));
