import React, { PureComponent } from 'react';
import { TsRightSideTabComponent } from './RightSideTab';
import { TsRightSideTabbarComponent } from './RightSideTabbar';
import { TsRightSideHistoryComponent } from './RightSideHistory';

export class TsRightSidebar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <TsRightSideTabComponent />
        <TsRightSideTabbarComponent />
        <TsRightSideHistoryComponent />
      </div>
    );
  }
}
