import React, { PureComponent, ReactNode } from 'react';

import Tabs from './Tabs';
import Tab from './Tab';

import { TsRightSideTabbarComponent } from './RightSideTabbar';
import { TsRightSideHistoryComponent } from './RightSideHistory';
import { TsRightSideLogComponent } from './RightSideLog';

export class TsRightSidebar extends PureComponent {

  getTabNode(title, icon): () => ReactNode {
    return () => { return (<>
        <i className={`fa ${icon} fa-2`} />
        <span className="fms-right-tap-alarm-title">
          {title}
        </span>
      </>);
    };
  }

  render(): ReactNode {
    return (<Tabs>

      {/* Alarm Log Tab */}
      <Tab
        name="alarm" initActive={true}
        heading={this.getTabNode('알람', "fms-right-tap-alarm-icon fa-bell").bind(this)}
      >
        <TsRightSideTabbarComponent />
        <TsRightSideHistoryComponent />
      </Tab>

      {/* System Log Tab */}
      <Tab
        name="log"
        heading={this.getTabNode('시스템 로그', "fms-right-tap-alarm-icon fa-window-maximize").bind(this)}
      >
        <TsRightSideTabbarComponent />
        <TsRightSideLogComponent />
      </Tab>

    </Tabs>
    );
  }
}
