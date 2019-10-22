// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';

// thingspin libs
import TsMenuLv1 from './MenuLv1';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

export interface Props {
  menu: any[];
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
    const { menu } = this.props;

    return Array.isArray(menu)
      ? menu.filter(({ hideFromMenu, icon, divider }) => !hideFromMenu && icon && !divider)
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


const mapStateToProps = ({ thingspinMenu: { menu } }: any) => ({
  menu,
});

const mapDispatchToProps = {
  // updateTsMenu,
};

export default connectWithStore(TsMenu, mapStateToProps, mapDispatchToProps);
