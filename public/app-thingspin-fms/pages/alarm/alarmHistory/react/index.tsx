// js 3rd party libs
import React, { useState, useEffect } from 'react';

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
  const [history, setHistory] = useState([] as AlarmItem[]);
  const [search, setSearch] = useState('');

  // Life Cycle
  useEffect(() => {
    fetchHistory().then(setHistory);
  }, []);

  // Data Processing
  const itemFiltering = ({ alertName }: AlarmItem): boolean =>
    !(search && !alertName.includes(search)); // text search

  // Events
  function onChange({ confirm, state, range: { from, to }, }: OnChangePayload) {
    const params = [
      {
        from: from && from.utc().unix() * 1000,
        to: to && to.utc().unix() * 1000,
      },
      state,
      confirm ? JSON.parse(confirm) : null,
    ];
    fetchHistory(...params).then(setHistory);
  }

  // Render
  return (<AlarmHistBaseLayer title='알람 이력 현황'>
    <TsContainer >
      <TsAlarmHistorySearch onChange={onChange} onTextChange={setSearch} />
      <section>
        <ol>
          {history
            .filter(itemFiltering)
            .map((item, index) =>
              <TsAlarmHistoryItem key={index} item={item} search={search} />
          )}
        </ol>
      </section>
    </TsContainer>
  </AlarmHistBaseLayer>);
};

export default AlarmHistory;
