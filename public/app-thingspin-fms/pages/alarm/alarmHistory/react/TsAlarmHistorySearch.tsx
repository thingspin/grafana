// js 3rd party libs
import React, { useState } from 'react';

// Grafana libs
import { getShiftedTimeRange } from 'app/core/utils/timePicker';
import { toUtc, TimeRange, TimeOption, RawTimeRange } from '@grafana/data';

// ThingSPIN libs
// Views
import TsTimePicker from './TsTimePicker';
// Etc
import { baseClass, tsDefaultSelectOptions, genTimeRange, alarmOptions } from '../types';

export interface OnChangePayload {
  text: string;
  state: string;
  timeRange: TimeRange;
}

export interface AlarmSearchProps {
  onChange?: (payload: OnChangePayload) => void;
}

// use common className
const bcls = `${baseClass}-search`;

const TsAlarmHistorySearch: React.FC<AlarmSearchProps> = ({ onChange }) => {
  // State & Ref
  const selectRef = React.createRef<HTMLSelectElement>();
  const inputRef = React.createRef<HTMLInputElement>();
  const [timeRange, setTimeRange] = useState(genTimeRange());

  // Event Processing
  const onChangeEvt = () => {
    if (onChange) {
      onChange({
        timeRange,
        text: inputRef.current.value,
        state: selectRef.current.value,
      });
    }
  };

  const shiftTime = (direction = 1) => {
    const { from, to } = getShiftedTimeRange(direction, timeRange);
    return {
      from: toUtc(from),
      to: toUtc(to),
      raw: timeRange.raw,
    };
  };

  const onChangeTimePicker = (range: TimeRange) => {
    setTimeRange(range);
    if (onChange) {
      onChange({
        timeRange: range,
        text: inputRef.current.value,
        state: selectRef.current.value,
      });
    }
  };


  const onMoveBack = () => {
    setTimeRange(shiftTime(-1));
  };

  const onMoveForward = () => {
    setTimeRange(shiftTime(1));
  };

  const onZoom = () => { };

  const setActiveTimeOption = (timeOptions: TimeOption[], rawTimeRange: RawTimeRange): TimeOption[] => {
    return timeOptions.map(option => {
        return {
        ...option,
        active: (option.to === rawTimeRange.to && option.from === rawTimeRange.from),
      };
    });
  };

  return <div className={bcls}>
    <div className={`${bcls}-l`}>
      <span className={`${bcls}-l-search`}>
        <i className="fa fa-search"></i>
        <input ref={inputRef} type="text" placeholder="알람 이름을 입력해 주세요." onChange={onChangeEvt} />
      </span>

      <span>
        <span className={`${bcls}-l-text`}> 상태 </span>
        <select ref={selectRef} onChange={onChangeEvt}>
          {alarmOptions.map(({ value, label }, index) =>
            (<option key={index} value={value}>{label}</option>))
          }
        </select>
      </span>
    </div>

    <div className={`${bcls}-r`}>
      <span className={`${bcls}-r-item ts-color-red`}>
        <i className="icon-gf icon-gf-critical"></i> 위험
      </span>

      <span className={`${bcls}-r-item ts-color-yellow`}>
        <i className="fa fa-exclamation"></i> 경고
      </span>

      <span className={`${bcls}-r-item ts-color-green`}>
        <i className="icon-gf icon-gf-online"></i> 정상
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
