import React from 'react';

import { baseClass } from '../types';

export interface AlarmSearchProps {
  onChange?: (text: string, state: string) => void;
}

// use common className
const bcls = `${baseClass}-search`;

const TsAlarmSearch: React.FC<AlarmSearchProps> = ({ onChange }) => {
  const options: any[] = [
    { value: '', label: 'ALL'},
    { value: 'ok', label: '정상'},
    { value: 'alerting', label: '위험'},
    { value: 'pending', label: '경고'},
    { value: 'pause', label: '정지'},
  ];

  const selectRef = React.createRef<HTMLSelectElement>();
  const inputRef = React.createRef<HTMLInputElement>();

  const onChangeEvt = () => {
    onChange(inputRef.current.value, selectRef.current.value);
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
          {options.map(({ value, label }, index) =>
            (<option key={index} value={value}>{label}</option>))
          }
        </select>
      </span>
    </div>

    <div className={`${bcls}-r`}>
      <span className={`${bcls}-r-item ts-color-red`}>
        <i className="fa fa-info-circle"></i> 위험
      </span>

      <span className={`${bcls}-r-item ts-color-yellow`}>
        <i className="fa fa-exclamation-triangle"></i> 경고
      </span>

      <span className={`${bcls}-r-item ts-color-green`}>
        <i className="fa fa-info"></i> 정상
      </span>
    </div>
  </div>;
};

export default TsAlarmSearch;
