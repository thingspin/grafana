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
      maxDisplayChildren: 3,
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
      <div onClick={this.arrowClickEvt}>
        <i className={menu.children ? arrowIcon : null} />
      </div>
    );
  }

  get pinDOM() {
    const { opendedSubmenu, pin } = this.state;
    const pinIcon = pin ? 'fa fa-check-circle' : 'fa fa-check-circle-o';

    return opendedSubmenu ? (
      <div onClick={this.pinClickEvt}>
        <i className={pinIcon} />
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
        {menu.children.map((item, idx) => (
          <TsMenuLv2 key={idx} menu={item} />
        ))}{' '}
      </div>
    ) : null;

    return opendedSubmenu ? DOM : null;
  }

  render() {
    const { menu } = this.props;

    return (
      <div className="fms-menu-lv1">
        <div className="fms-menu-header" key="menulv1">
          <div className="" />
          <div className="">
            <a href={menu.url}>
              <i className={menu.icon} />
              {menu.text}
            </a>
          </div>

          {this.arrowDOM}
          {this.pinDOM}
        </div>

        {this.childrenDOM}
      </div>
    );
  }
}
