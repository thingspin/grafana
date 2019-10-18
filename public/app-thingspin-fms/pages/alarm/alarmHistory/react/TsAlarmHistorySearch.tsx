// js 3rd party libs
import React, { useState, createRef } from 'react';

// Grafana libs
import { TimeRange, TimeOption, RawTimeRange } from '@grafana/data';

// ThingSPIN libs
// Views
import TsTimePicker from './TsTimePicker';
// Etc
import { baseClass, tsDefaultSelectOptions, genTimeRange, alarmOptions, shiftTime, AlarmType } from '../types';

export interface OnChangePayload {
  state: AlarmType;
  confirm: string;
  range: TimeRange;
}

export interface AlarmSearchProps {
  onChange?: (payload: OnChangePayload) => void;
  onTextChange?: (payload: string) => void;
}

const stateOptions = [
  { value: '', label: '모두'},
  { value: 'true', label: '확인'},
  { value: 'false', label: '미확인'},
];

// use common className
const bcls = `${baseClass}-search`;

const TsAlarmHistorySearch: React.FC<AlarmSearchProps> = ({ onChange, onTextChange }) => {
  // State & Ref
  const [timeRange, setTimeRange] = useState(genTimeRange());
  const selectRef = createRef<HTMLSelectElement>();
  const stateSelectRef = createRef<HTMLSelectElement>();
  const inputRef = createRef<HTMLInputElement>();

  // Component methods
  const setActiveTimeOption = (timeOptions: TimeOption[], { from, to }: RawTimeRange): TimeOption[] => timeOptions.map(option => ({
    ...option,
    active: (option.to === to && option.from === from),
  }));

  // Events
  const onChangeTimePicker = (range: TimeRange) => {
    if (onChange) {
      onChange({
        state: selectRef.current.value as AlarmType,
        confirm: stateSelectRef.current.value,
        range,
      });
    }
    setTimeRange(range);
  };

  const onMoveBack = () => setTimeRange(shiftTime(timeRange, -1));

  const onMoveForward = () => setTimeRange(shiftTime(timeRange, 1));

  const onZoom = () => { };

  const onChangeText = () => {
    if (onTextChange) {
      onTextChange(inputRef.current.value);
    }
  };

  const onChangeEvt = () => (onChange && onChange({
    state: selectRef.current.value as AlarmType,
    confirm: stateSelectRef.current.value,
    range: timeRange,
  }));

  return <div className={bcls}>
    <div className={`${bcls}-l`}>
      <span className={`${bcls}-l-search`}>
        <i className="fa fa-search"></i>
        <input ref={inputRef} type="text" placeholder="알람 이름을 입력해 주세요." onChange={onChangeText} />
      </span>

      <span>
        <span className={`${bcls}-l-text`}> 상태 </span>
        <select ref={selectRef} onChange={onChangeEvt}>
          {alarmOptions.map(({ value, label }, index) =>
            <option key={index} value={value}>{label}</option>
          )}
        </select>
      </span>

      <span>
        <span className={`${bcls}-l-text`}> 확인 </span>
        <select ref={stateSelectRef} onChange={onChangeEvt}>
          {stateOptions.map(({ value, label }, index) =>
            <option key={index} value={value}>{label}</option>
          )}
        </select>
      </span>
    </div>

    <div className={`${bcls}-r`}>
      <span className={`${bcls}-r-item ts-color-red`}>
        <i className="icon-gf icon-gf-critical" />위험
      </span>

      <span className={`${bcls}-r-item ts-color-yellow`}>
        <i className="fa fa-exclamation" />경고
      </span>

      <span className={`${bcls}-r-item ts-color-green`}>
        <i className="icon-gf icon-gf-online" />정상
      </span>

      <span className={`${bcls}-r-time`}>
        <TsTimePicker
          value={timeRange}
          onChange={onChangeTimePicker}
          timeZone={'kr'}
          onMoveBackward={onMoveBack}
          onMoveForward={onMoveForward}
          onZoom={onZoom}
          selectOptions={setActiveTimeOption(tsDefaultSelectOptions, timeRange.raw)}
        />
      </span>
    </div>
  </div>;
};

export default TsAlarmHistorySearch;
