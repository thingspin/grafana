import React, { PureComponent } from 'react';
import { TabbarProps } from '../models';
import FmsHistoryCard, { TS_ALARM_TYPE } from '../FmsHistoryCard/index';
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import { liveSrv } from 'app/core/core';
// tslint:disable-next-line: import-blacklist
import moment from 'moment';
import { Switch } from '@grafana/ui';

export interface Props extends TabbarProps {

}

export interface States {
  list: any[];
  enable: boolean;
  checked: boolean;
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

interface AlarmPayload extends Simulator {
  evalMatches: any[];
  conditionEvals: string;
  ruleUrl: string;
}


export class TsRightSideHistoryComponent extends PureComponent<Props, States> {
  state: States = { // init
    list: [],
    enable: this.props.play,
    checked: false,
  };

  dateFormat = "YYYY년 MM월 DD일";
  source: any;
  maxLength = 10;

  async UNSAFE_componentWillMount() {
    await liveSrv.getConnection();

    this.source = liveSrv.subscribe('ts-alarm');
    if (this.source) {
      this.source.subscribe(this.liveSubscribe);
    }
  }

  UNSAFE_componentWillReceiveProps(next: Props) {
    this.setState({ enable: next.play });
  }

  componentWillUnmount() {
    if (this.source) {
      liveSrv.removeObserver('ts-alarm', this.source);
    }
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

  liveSubscribe = (value: WsStream): void => {
    const { list, enable } = this.state;
    if (!enable) {
      return;
    }

    if (list.length > this.maxLength) {
      list.pop();
    }
    list.push(value.data);

    list.sort((a, b) => a.time < b.time ? 1 : -1);

    const filtered = list
      .filter(this.dateFilter)
      .filter(this.alarmFilter)
      .map(this.setFieldData);

    this.setState({ list: [...filtered] });
  }

  dateFilter = ({ time }: Simulator): boolean => moment(this.props.date).format(this.dateFormat) === moment(time).format(this.dateFormat);

  alarmFilter = (curr: Simulator): boolean => !this.props.filters.includes(curr.alarmType);

  setFieldData = (origin: AlarmPayload) => {
    // convert history
    origin.history = origin.evalMatches.reduce((acc: any, { metric, value }: any) => {
      acc[metric] = value;
      return acc;
    }, {});

    // convert url
    const url = new URL(origin.ruleUrl.replace('/d/', '/thingspin/alarm/edit/'));
    origin.ruleUrl = url.pathname;
    return origin;
  }

  onChangeChecked = ({ target }: React.SyntheticEvent) => {
    const { checked } = target as HTMLInputElement;
    this.setState({ checked, });
  };

  render() {
    const { list, checked } = this.state;
    return <>
      <div className="ts-right-side-history-component">
        {list.map(({ title, subtitle, time, alarmType, history, ruleUrl }: AlarmPayload, index: number) =>
          <FmsHistoryCard key={index}
            title={title}
            subtitle={subtitle}
            history={history}
            time={new Date(time)}
            link={ruleUrl}

            isActive={true}
            alarmType={this.getAlarmType(alarmType)}
            historyType={TS_HISTORY_TYPE.ALARM}
          />
        )}
      </div>
      <div className="tsr-bottom">
        <div className="tsrb-left">
          <div>
            <i className="tsi icon-ts-notifications_active"></i>
            <span>알람 룰</span>
          </div>
          <div>
            <i className="tsi icon-ts-foresight"></i>
            <span>예지진단</span>
          </div>
        </div>
        <div>
          <Switch label="미확인" checked={checked} onChange={this.onChangeChecked} transparent />
        </div>
      </div>
    </>;
  }
}
