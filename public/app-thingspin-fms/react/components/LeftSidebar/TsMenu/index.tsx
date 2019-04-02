// JS Libraries
import React, { PureComponent } from 'react';
import _ from 'lodash';

// Grafana Libraries
import config from 'app/core/config';

// ThingSPIN data types(model)
import { EPermission } from 'app-thingspin-fms/models/common';
import { TsIMenuLv1 } from 'app-thingspin-fms/models/LeftSidebar';

// ThingSPIN Components
import TsMenuLv1 from './MenuLv1';

class TsMenu extends PureComponent {
  menuList: TsIMenuLv1[];
  navTree: any;
  mainLinks: any;

  constructor(props) {
    super(props);
    this.navTree = _.cloneDeep(config.bootData.thingspin.menu);
    this.mainLinks = _.filter(this.navTree, item => !item.hideFromMenu);

    this.menuList = [
      {
        arrow: true,
        extern: true,
        hasChild: [],
        icon: 'test',
        pinEnabled: true,
        pisDisplay: true,
        maxChildren: 3,
        title: 'hello',
        params: {},
        order: 1,
        url: 'test',
        target: 'test',
        perm: EPermission.ADMIN,
        navPath: [],
        isShow: true,
      },
    ];
  }

  get menuLv1DOM() {
    return this.navTree
      .filter(item => item.icon)
      .filter(item => !item.divider)
      .map((item, idx) => <TsMenuLv1 key={idx} menu={item} />);
  }

  render() {
    return <div className="fms-menu">{this.menuLv1DOM}</div>;
  }
}

export default TsMenu;
