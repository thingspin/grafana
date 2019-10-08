import React, { PureComponent, MouseEvent } from 'react';
import TsDatePicker from './TsDatePicker';


export interface Props {
  date: Date;
  filters: any[];
  play: boolean;

  onChangeDate: (date: Date) => void;
  onChangeFilter?: (filters: any[]) => void;
  onPlay?: (play: boolean) => void;
}

export interface States {
  filters: string[];
}

export class TsRightSideTabbarComponent extends PureComponent<Props, States> {
  state: States = {
    filters: this.props.filters,
  };

  filtering(target: string, e: MouseEvent<HTMLButtonElement>): void {
    const { onChangeFilter } = this.props;
    let { filters } = this.state;

    if (filters.includes(target)) {
      filters = filters.filter((value) => value !== target);
    } else {
      filters.push(target);
    }

    if (onChangeFilter) {
      onChangeFilter(filters);
    }

    this.setState({ filters: [...filters] });
  }

  onPlay = () => {
    const { onPlay, play } = this.props;

    if (onPlay) {
      onPlay(!play);
    }
  }

  render() {
    const { date, onChangeDate, play } = this.props;
    const { filters } = this.state;

    const errCls = `ts-btn ${!filters.includes('err') && 'ts-error'}`;
    const warnCls = `ts-btn ${!filters.includes('warn') && 'ts-warn'}`;

    return (<div className="ts-right-side-tabbar-component">
      <div className="tsr-timezone">
        <div className="tsr-title ">캘린더</div>
        <div className='tsr-content tsr-timezone'>
          <div>
            <TsDatePicker date={date} onChange={onChangeDate} />
          </div>
        </div>
      </div>
      <div className="tsr-br"></div>
      <div className="tsr-alarm-filter">
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
            <button className={`tsr-btn ${play && 'tsr-play'}`} onClick={this.onPlay}>
              <i className={`fa fa-${play ? 'play' : 'pause'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>);
  }
}
