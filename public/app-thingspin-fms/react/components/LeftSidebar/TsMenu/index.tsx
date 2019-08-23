// 3rd party libs
import React, { PureComponent, ReactNode, useContext } from 'react';

// thingspin libs
import TsMenuLv1 from './MenuLv1';
import { ThingspinContext, TsPrivderCtrl } from 'app-thingspin-fms/react/thingspinProvider';

export interface Props {
  ctx: TsPrivderCtrl;
}

export class TsMenu extends PureComponent<Props> {

  render() {
    const menu = this.filteredMenu();

    return <>
      <div className="fms-menu fms-menu-top" key="menu-top">
        {this.top(menu)}
      </div>
      <div className="fms-menu fms-menu-bottom" key="menu-bottom">
        <div className="fms-menu-dividers" key="ts-dividers">
          <hr className="fms-menu-dividers-divider" key="ts-divider" />
        </div>
        {this.bottom(menu)}
      </div>
    </>;
  }

  private filteredMenu(): any[] {
    const { tsMenu: menu } = this.props.ctx;

    return Array.isArray(menu)
      ? menu.filter(item => !item.hideFromMenu && item.icon && !item.divider)
      : [];
  }

  private renderMenuLv1 = (item: any): ReactNode => (<TsMenuLv1 key={item.id} menu={item} pinned={item.pinned} />);

  private top = (menu: any[]): ReactNode => (
    menu.filter(({ placeBottom }) => !placeBottom)
      .map(this.renderMenuLv1)
  );

  private bottom = (menu: any[]): ReactNode => (
    menu.filter(({ placeBottom }) => placeBottom)
      .map(this.renderMenuLv1)
  );
}

export default () => (<TsMenu ctx={useContext(ThingspinContext)}></TsMenu>);
