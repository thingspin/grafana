import React, { PureComponent } from 'react';
import { TabbarProps } from '../models';
import FmsHistoryCard, { TS_ALARM_TYPE } from '../FmsHistoryCard/index';
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import { liveSrv } from 'app/core/core';
// tslint:disable-next-line: import-blacklist
import moment from 'moment';

export interface Props extends TabbarProps {

}

export interface States {
  list: any[];
  enable: boolean;
}

interface WsStream {
  Stream: string;
  data: Simulator;
}

interface Simulator {
  title: string;
  subtitle?: string;
  time: string;
  alarmType: string;
  historyType: string;
  history: object;
}


export class TsRightSideHistoryComponent extends PureComponent<Props, States> {
  state: States = {
    list: [],
    enable: true,
  };

  async componentWillMount() {
    await liveSrv.getConnection();

    const source = liveSrv.subscribe('ts-alarm');
    source.subscribe(this.liveSubscribe.bind(this));
  }

  liveSubscribe(value: WsStream): void {
    const { list, enable } = this.state;
    if (!enable) {
      return;
    }

    if (list.length > 10) {
      list.splice(list.length-1, 1);
    }
    list.push(value.data);

    list.sort((a, b) => a.time < b.time ? 1 : -1);

    this.setState({ list: [...list] });
  }

  getAlarmType(type: string): TS_ALARM_TYPE {
    switch (type) {
      case TS_ALARM_TYPE.WARNING:
        return TS_ALARM_TYPE.WARNING;
      case TS_ALARM_TYPE.ERROR:
        return TS_ALARM_TYPE.ERROR;
      default:
        return TS_ALARM_TYPE.NORMAL;
    }
  }

  dateFilter(curr: Simulator): boolean {
    const dateFormat = "YYYY년 MM월 DD일";
    const { date } = this.props;
    const filterStr = moment(date).format(dateFormat);
    const currStr = moment(curr.time).format(dateFormat);

    return filterStr === currStr;
  }

  alarmFilter(curr: Simulator): boolean {
    const { filters } = this.props;

    return !filters.includes(curr.alarmType);
  }

  render() {
    const { list } = this.state;

    const filtered = list
      .filter(this.dateFilter.bind(this))
      .filter(this.alarmFilter.bind(this));

    return <div className="ts-right-side-history-component">
      {filtered.map((value: Simulator, index: number) => {
        return <FmsHistoryCard key={index}
          title={value.title}
          subtitle={value.subtitle}
          history={value.history}
          time={new Date(value.time)}

          isActive={true}
          alarmType={this.getAlarmType(value.alarmType)}
          historyType={TS_HISTORY_TYPE.ALARM}
        />;
      })}
    </div>;
  }
}
