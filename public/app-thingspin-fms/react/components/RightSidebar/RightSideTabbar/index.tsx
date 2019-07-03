import React, { PureComponent, MouseEvent } from 'react';
import TsDatePicker from './TsDatePicker';


export interface Props {
  date: Date;
  filters: any[];
  play: boolean;

  onChangeDate?: (date: Date) => void;
  onChangeFilter?: (filters: any[]) => void;
  onPlay?: (play: boolean) => void;
}

export interface States {
  filters: string[];
  play: boolean;
}

export class TsRightSideTabbarComponent extends PureComponent<Props, States> {
  state: States = {
    filters: this.props.filters,
    play: this.props.play,
  };

  filtering(target: string, e: MouseEvent<HTMLButtonElement>): void {
    const { onChangeFilter } = this.props;
    let { filters } = this.state;

    if (filters.includes(target)) {
      filters = filters.filter((value) => {
        return value !== target;
      });
    } else {
      filters.push(target);
    }

    if (onChangeFilter) {
      onChangeFilter(filters);
    }

    this.setState({ filters: [...filters] });
  }

  onPlay() {
    const { onPlay } = this.props;
    const { play } = this.state;

    if (onPlay) {
      onPlay(!play);
    }
    this.setState({
      play: !play,
    });
  }

  get renderCalendarLayout() {
    const { date } = this.props;

    return <div className="tsr-timezone">
      <div className="tsr-title ">캘린더</div>
      <div className='tsr-content tsr-timezone'>
        <div>
          <TsDatePicker date={date} onChange={this.props.onChangeDate}/>
        </div>

        {/* 무슨 기능? */}
        <div></div>

      </div>
    </div>;
  }

  get renderFilterLayout() {
    const { filters, play } = this.state;

    const errCls = `ts-btn ${ !filters.includes('err') ? 'ts-error' : ''}`;
    const warnCls = `ts-btn ${ !filters.includes('warn') ? 'ts-warn' : ''}`;

    return <div className="tsr-alarm-filter">
      <div>
        <div className='tsr-title'>알람 이벤트</div>
        <div className='tsr-content'>
          <div>
            <button className={errCls} onClick={this.filtering.bind(this, 'err')}>
              <i className="tsi icon-ts-error1"></i>심각</button>
            <button className={warnCls} onClick={this.filtering.bind(this, 'warn')}>
              <i className="tsi icon-ts-warning1"></i>경고</button>
          </div>
        </div>
      </div>
      <div className="tsr-alarm-play">
        <div className='tsr-title'>알람 {play ? '동작' : '중지'}</div>
        <div className='tsr-content'>
          <button className={`tsr-btn ${play ? 'tsr-play': ''}`} onClick={this.onPlay.bind(this)}>
            <i className={`fa ${play ? 'fa-play' : 'fa-pause'}`}></i>
          </button>
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
