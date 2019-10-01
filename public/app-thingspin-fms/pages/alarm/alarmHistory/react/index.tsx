// js 3rd party libs
import React, { useState, useEffect } from 'react';

// Grafana libs
import { TimeRange } from '@grafana/data';

// thingspin libs
// Views
import TsContainer from '../../common/react/TsContainer';
import AlarmHistBaseLayer from './BaseLayer';
import TsAlarmHistoryItem from './TsAlarmHistoryItem';
import TsAlarmHistorySearch, { OnChangePayload } from './TsAlarmHistorySearch';
// etc
import { AlarmItem, fetchHistory } from '../types';

const AlarmHistory: React.FC<any> = () => {
  // States
  const [ history, setHistory ] = useState([] as AlarmItem[]);
  const [ search, setSearch ] = useState({ text: '', state: '' } as OnChangePayload);

  // Life Cycle
  useEffect(() => {
    fetchHistory().then(setHistory);
  }, []);

  // Events
  function itemFiltering({ newState, alertName }: AlarmItem): boolean {
    const { text, state } = search;

    return !((state && state !== newState) // state search
      || (text && !alertName.includes(text)) // text search
    );
  }

  function reload({ from, to }: TimeRange) {
    fetchHistory({ from: from.utc().unix() * 1000, to: to.utc().unix() * 1000, }).then(setHistory);
  }

  // Render
  return (<AlarmHistBaseLayer title='알람 이력 현황'>
    <TsContainer >
      <TsAlarmHistorySearch onChange={setSearch} onTimeChange={reload} />
      <section>
        <ol>
          {history
            .filter(itemFiltering)
            .map((item, index) => <TsAlarmHistoryItem key={index} item={item} search={search.text} />)
          }
        </ol>
      </section>
    </TsContainer>
  </AlarmHistBaseLayer>);
};

export default AlarmHistory;
