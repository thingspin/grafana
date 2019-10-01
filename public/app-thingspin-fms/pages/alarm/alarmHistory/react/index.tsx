// js 3rd party libs
import React, { useState, useEffect } from 'react';

// Grafana libs
// Services
import { getBackendSrv } from 'app/core/services/backend_srv';
// Data & Model
import alertDef from 'app/features/alerting/state/alertDef';
import { dateTime } from '@grafana/data';

// thingspin libs
// Views
import TsContainer from '../../common/react/TsContainer';
import AlarmHistBaseLayer from './BaseLayer';
import TsAlarmHistoryItem from './TsAlarmHistoryItem';
// etc
import { AlarmType, AlarmAPI, AlarmItem } from '../types';
import TsAlarmHistorySearch, { OnChangePayload } from './TsAlarmHistorySearch';

export interface AlarmHistoryProps { }

export const AlarmHistory: React.FC<AlarmHistoryProps> = (_) => {
  const fetchData = (limit = 50, type = AlarmType.ALERT) => (getBackendSrv().get(AlarmAPI.Annotations, { limit, type }));

  // History State
  const [history, setHistory] = useState([]);
  useEffect(() => {
    (async () => {
      const result: AlarmItem[] = await fetchData();
      setHistory(result.map((item) => {
        const timeStr = dateTime(item.time).fromNow(true);

        const model = alertDef.getStateDisplayModel(item.newState);
        model.iconClass = model.iconClass.replace('alert', 'alarm');
        model.stateClass = model.stateClass.replace('alert', 'alarm');

        return { ...item, model, timeStr, };
      }));
    })();
  }, []);

  // search State
  const [search, setSearch] = useState({ text: '', state: '', timeRange: {} } as OnChangePayload);
  const onChange = (payload: OnChangePayload) => setSearch(payload);

  // Events
  const itemFiltering = ({ newState, alertName, time }: AlarmItem): boolean => {
    const { text, state, timeRange: { from, to } } = search ;
    return !(
      (state && state !== newState) // state search
      || (text && !alertName.includes(text)) // text search
      || (from && to && !(from.diff(time) < 0 && to.diff(time) > 0)) // time search
    );
  };

  const section = <section>
    <ol>
      {history
        .filter(itemFiltering)
        .map((item, index) => <TsAlarmHistoryItem key={index} item={item} search={search.text} />)
      }
    </ol>
  </section>;

  return (<AlarmHistBaseLayer title='알람 이력 현황'>
    <TsContainer >
      <TsAlarmHistorySearch onChange={onChange} />
      {section}
    </TsContainer>
  </AlarmHistBaseLayer>);
};

export default AlarmHistory;
