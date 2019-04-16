import React, { PureComponent } from 'react';
import TsMenuLv2 from './MenuLv2';

interface Props {
  menu: any;
}

interface State {
  opendedSubmenu: boolean;
  maxDisplayChildren: number;
  pin: boolean;
}

export default class TsMenuLv1 extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    // init state
    this.state = {
      opendedSubmenu: false,
      maxDisplayChildren: 8,
      pin: false,
    };
  }

  arrowClickEvt = () => {
    const { opendedSubmenu } = this.state;
    const pin = opendedSubmenu ? false : this.state.pin;

    this.setState({
      opendedSubmenu: !opendedSubmenu,
      pin,
    });
  };

  pinClickEvt = () => {
    this.setState({ pin: !this.state.pin });
  };

  get arrowDOM() {
    const { menu } = this.props,
      { opendedSubmenu } = this.state;
    const arrowIcon = opendedSubmenu ? 'fa fa-caret-down' : 'fa fa-caret-up';

    return (
      <div className="fms-menu-header-controls-arrow" onClick={this.arrowClickEvt}>
        <span>
          <i className={menu.children ? arrowIcon : null} />
        </span>
      </div>
    );
  }

  get pinDOM() {
    const { opendedSubmenu, pin } = this.state;
    const pinIcon = pin ? 'ts-leftsidebar-icons ts-left-icon-pin-on' : 'ts-leftsidebar-icons ts-left-icon-pin-off';

    return opendedSubmenu ? (
      <div className="fms-menu-header-controls-pin" onClick={this.pinClickEvt}>
        <span>
          <i className={pinIcon} />
        </span>
      </div>
    ) : null;
  }

  get childrenDOM() {
    const { menu } = this.props,
      { maxDisplayChildren, opendedSubmenu } = this.state;

    const bodyStyle =
      menu.children && menu.children.length >= maxDisplayChildren
        ? {
            height: `${maxDisplayChildren * 28}px`,
          }
        : {};

    const DOM = menu.children ? (
      <div key="menulv2" className="fms-menu-body" style={bodyStyle}>
        {' '}
        {menu.children
          .filter(item => !item.divider)
          .map((item, idx) => (
            <TsMenuLv2 key={idx} menu={item} />
          ))}{' '}
      </div>
    ) : null;

    return opendedSubmenu ? DOM : null;
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
