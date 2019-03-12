import React, { PureComponent } from 'react';

export class TsRightSideTabbarComponent extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ts-right-side-tabbar-component">
        <div className="ts-right-side-tab-timezone-title-calendar">캘린더</div>
        <div className="ts-right-side-tab-timezone-title-event">알람 이벤트</div>
      </div>
    );
  }
}
