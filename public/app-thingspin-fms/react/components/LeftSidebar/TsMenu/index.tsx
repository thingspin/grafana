// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';

// grafana libs
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// thingspin libs
import TsMenuLv1 from './MenuLv1';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

export interface Props extends TsBaseProps {
  menu: any[];
}

export class TsMenu extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

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

    return menu
      ? menu.filter(item => !item.hideFromMenu && item.icon && !item.divider)
      : [];
  }

  private renderMenuLv1 = (item: any): ReactNode => (<TsMenuLv1 key={item.id} menu={item} pinned={item.pinned} />);

  private top = (menu: any[]): ReactNode => (menu.filter(({ placeBottom }) => !placeBottom).map(this.renderMenuLv1));

  private bottom = (menu: any[]): ReactNode => (menu.filter(({ placeBottom }) => placeBottom).map(this.renderMenuLv1));
}

const mapStateToProps = ({ thingspinMenu: { menu }}: any) => ({ menu });

export default connectWithStore(TsMenu, mapStateToProps);
