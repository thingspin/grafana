import React, { PureComponent, MouseEvent } from 'react';
import TsDatePicker from './TsDatePicker';

export class TsRightSideTabbarComponent extends PureComponent {
  filtering(target: string, e: MouseEvent<HTMLButtonElement>) {
    alert('준비중입니다.');
  }

  get renderCalendarLayout() {
    return <div className="tsr-timezone">
      <div className="tsr-title ">캘린더</div>
      <div className='tsr-content tsr-timezone'>
        <div>
          <TsDatePicker />
        </div>

        {/* 무슨 기능? */}
        <div></div>

      </div>
    </div>;
  }

  get renderFilterLayout() {
    return <div className="tsr-alarm-filter">
      <div className='tsr-title'>알람 이벤트</div>
      <div className='tsr-content'>
        <div>
          <button className="ts-btn ts-error" onClick={this.filtering.bind(this, 'err')}>
            <i className="tsi icon-ts-error1"></i>심각</button>
          <button className="ts-btn ts-warn" onClick={this.filtering.bind(this, 'warn')}>
            <i className="icon-ts-warning1"></i>경고</button>
        </div>
      </div>
    </div>;
  }

  render() {
    return (<div className="ts-right-side-tabbar-component">
      {this.renderCalendarLayout}
      <div className="tsr-br"></div>
      {this.renderFilterLayout}
    </div>);
  }
}
