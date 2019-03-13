import React, { PureComponent } from 'react';
import Tabs from './Tabs';
import { TsRightSideTabbarComponent } from './RightSideTabbar';
import { TsRightSideHistoryComponent } from './RightSideHistory';
import { TsRightSideLogComponent } from './RightSideLog';

export class TsRightSidebar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Tabs>
          <Tabs.Tab
            name="alarm"
            initialActive={true}
            heading={() => (
              <li className="fms-right-tapitem fms-right-tap-alarm">
                <i className="fms-right-tap-alarm-icon fa fa-bell fa-2" />
                <span className="fms-right-tap-alarm-title">알람</span>
              </li>
            )}
          >
            <TsRightSideTabbarComponent />
            <TsRightSideHistoryComponent />
          </Tabs.Tab>
          <Tabs.Tab
            name="log"
            heading={() => (
              <li className="fms-right-tapitem fms-right-tap-systemlog">
                <i className="fms-right-tap-alarm-icon fa fa-window-maximize fa-2" />
                <span className="fms-right-tap-alarm-title">시스템 로그</span>
              </li>
            )}
          >
            <TsRightSideTabbarComponent />
            <TsRightSideLogComponent />
          </Tabs.Tab>
        </Tabs>
      </div>
    );
  }
}
