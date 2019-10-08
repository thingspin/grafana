// js 3rd party libs
import React, { PureComponent } from 'react';

// Grafana libs
import { Switch } from '@grafana/ui';
import { liveSrv } from 'app/core/core';
import { dateTime } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

// Thingspin libs
import { TabbarProps } from '../models';
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import FmsHistoryCard, { TS_ALARM_TYPE } from '../FmsHistoryCard/index';
import { AnnotationQuery, AlarmType } from 'app-thingspin-fms/pages/alarm/alarmHistory/types';

export enum AlarmAPI {
  Annotations = '/api/annotations'
}

export interface AlarmHistoryPayload {
  id: number;
  alertId: number;
  alertName: string;
  dashboardId: number;
  panelId: number;
  userId: number;
  newState: string;
  prevState: string;
  created: number | Date;
  updated: number | Date;
  time: number | Date;
  timeEnd: number | Date;
  text: string;
  tags: any[];
  login: string;
  email: string;
  avvatarUrl: string;
  data: any;

  // thingpsin add field----
  confirm: boolean;
  confirmDate: number | Date;
}

export interface Props extends TabbarProps {}

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
  time: string | number | Date;
  alarmType: string;
  historyType: string;
  history: object;
}

interface AlarmPayload extends Simulator {
  evalMatches: any[];
  conditionEvals: string;
  ruleUrl: string;
}

export const fetchHistory = async (params?: AnnotationQuery, limit = 100000, type = AlarmType.ALERT, ): Promise<AlarmHistoryPayload[]> => (
  getBackendSrv().get(AlarmAPI.Annotations, { ...params, limit, type, })
);

export function getAlarmType(type: string): TS_ALARM_TYPE {
  switch (type) {
    case TS_ALARM_TYPE.WARNING:
      return TS_ALARM_TYPE.WARNING;
    case TS_ALARM_TYPE.ERROR:
      return TS_ALARM_TYPE.ERROR;
    default:
      return TS_ALARM_TYPE.NORMAL;
  }
}

export function convAlarmType(type: string) {
  switch (type) {
    case AlarmType.ALERT:
    case TS_ALARM_TYPE.ERROR:
        return TS_ALARM_TYPE.ERROR;
    case AlarmType.WARNING:
    case TS_ALARM_TYPE.WARNING:
        return TS_ALARM_TYPE.WARNING;
    default:
      return TS_ALARM_TYPE.NORMAL;
  }
}

export function setFieldData(origin: AlarmPayload) {
  // convert history
  if (Array.isArray(origin.evalMatches)) {
    origin.history = origin.evalMatches.reduce((acc: any, { metric, value }: any) => {
      acc['알람 발생 태그'] = metric;
      acc['알람 발생 값'] = value;
      return acc;
    }, {});
  }

  // convert url
  try {
    const url = new URL(origin.ruleUrl.replace('/d/', '/thingspin/alarm/edit/'));
    origin.ruleUrl = url.pathname;
  } catch (e) {
  }
  return origin;
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

  async getCurrHistory(date: Date = this.props.date) {
    const cpDate = new Date(date); // deep copy
    const from = cpDate.setHours(0, 0, 0, 0);
    const to = cpDate.setHours(24, 0, 0, 0);

    const list = await fetchHistory({ from, to });

    return list.filter(({ newState }) => newState === 'alerting' || newState === 'pending')
      .map(({newState, alertName, data, time}): AlarmPayload => ({
        alarmType: convAlarmType(newState),
        evalMatches: data.evalMatches,
        title: alertName,
        time: time,
        conditionEvals: '',
        history: {},
        historyType: convAlarmType(newState),
        ruleUrl: '/',
      }))
      .filter(this.alarmFilter)
      .map(setFieldData);
  }

  async UNSAFE_componentWillMount() {
    await liveSrv.getConnection();

    this.source = liveSrv.subscribe('ts-alarm');
    this.source.subscribe(this.liveSubscribe);

    const list = await this.getCurrHistory();
    this.setState({ list });
  }

  async UNSAFE_componentWillReceiveProps({ play: enable, date }: Props) {
    const list = await this.getCurrHistory(date);
    this.setState({ list, enable });
  }

  componentWillUnmount() {
    if (this.source) {
      liveSrv.removeObserver('ts-alarm', this.source);
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
      .map(setFieldData);

    this.setState({ list: [...filtered] });
  }

  dateFilter = ({ time }: Simulator): boolean => dateTime(this.props.date).format(this.dateFormat) === dateTime(time).format(this.dateFormat);

  alarmFilter = ({ alarmType }: Simulator): boolean => !this.props.filters.includes(alarmType);

  onChangeChecked = ({ target }: React.SyntheticEvent) => this.setState({ checked: (target as HTMLInputElement).checked });

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
            alarmType={getAlarmType(alarmType)}
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
