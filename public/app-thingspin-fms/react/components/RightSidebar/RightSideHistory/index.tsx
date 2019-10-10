// js 3rd party libs
import React, { PureComponent } from 'react';
import { Observable } from 'rxjs';

// Grafana libs
import { Switch } from '@grafana/ui';
import { liveSrv } from 'app/core/core';
import { dateTime } from '@grafana/data';

// Thingspin libs
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import FmsHistoryCard from '../FmsHistoryCard';
import { AlarmType } from 'app-thingspin-fms/pages/alarm/alarmHistory/types';
import { AlarmPayload, WsStream } from './types';
import { fetchHistory, setFieldData, convAlarmType, getAlarmType } from './models';
import { TabbarProps } from '../models';

export interface Props extends TabbarProps { }

export interface States {
  list: AlarmPayload[];
  enable: boolean;
  checked: boolean;
}

export class TsRightSideHistoryComponent extends PureComponent<Props, States> {
  state: States = { // init
    list: [],
    enable: this.props.play,
    checked: false,
  };

  dateFormat = "YYYY년 MM월 DD일";
  liveObs: Observable<WsStream>;

  async getCurrHistory(date: Date = this.props.date) {
    const cpDate = dateTime(date); // deep copy
    const from = cpDate.startOf('day').valueOf();
    const to = cpDate.endOf('day').valueOf();

    const [alarmList, warnList] = await Promise.all([
      fetchHistory(AlarmType.ALERT, { from, to }),
      fetchHistory(AlarmType.WARNING, { from, to })
    ]);
    const list = [...alarmList, ...warnList];

    return list.filter(({ newState }) => newState === 'alerting' || newState === 'pending')
      .map(({ newState, alertName: title, data: { evalMatches }, time, uid, slug }): AlarmPayload => {
        const r = 10; // 10 seconds
        const d = dateTime(time);
        const ruleUrl = `/thingspin/alarm/edit/${uid}/${slug}?from=${d.subtract(r, 'second').valueOf()}&to=${d.add(r, 'second').valueOf()}`;
        const alarmType = convAlarmType(newState);

        return {
          time,
          title,
          ruleUrl,
          alarmType,
          evalMatches,

          history: {},
          conditionEvals: '',
          historyType: alarmType,
        };
      })
      .filter(this.alarmFilter)
      .map(setFieldData);
  }

  async UNSAFE_componentWillMount() {
    await liveSrv.getConnection();
    this.liveObs = liveSrv.subscribe('ts-alarm');
    this.liveObs.subscribe(this.liveSubscribe);

    const list = await this.getCurrHistory();
    this.setState({ list });
  }

  async UNSAFE_componentWillReceiveProps({ play: enable, date }: Props) {
    const list = await this.getCurrHistory(date);
    this.setState({ list, enable });
  }

  componentWillUnmount() {
    if (this.liveObs) {
      liveSrv.removeObserver('ts-alarm', this.liveObs);
    }
  }

  liveSubscribe = ({ data }: WsStream): void => {
    const { list, enable } = this.state;
    if (!enable) {
      return;
    }

    const arr = [data];
    arr.filter(this.dateFilter)
      .filter(this.alarmFilter)
      .map(setFieldData);

    if (arr.length) {
      list.unshift(arr[0]);
      this.setState({ list: [...list] });
    }
  }

  dateFilter = ({ time }: AlarmPayload): boolean => dateTime(this.props.date).format(this.dateFormat) === dateTime(time).format(this.dateFormat);

  alarmFilter = ({ alarmType }: AlarmPayload): boolean => !this.props.filters.includes(alarmType);

  onChangeChecked = ({ target }: React.SyntheticEvent) => this.setState({ checked: (target as HTMLInputElement).checked });

  render() {
    const { list, checked } = this.state;
    return <>
      <div className="ts-right-side-history-component">
        {list.map(({ title, subtitle, time, alarmType, history, ruleUrl }: AlarmPayload, idx: number) =>
          <FmsHistoryCard key={idx}
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
