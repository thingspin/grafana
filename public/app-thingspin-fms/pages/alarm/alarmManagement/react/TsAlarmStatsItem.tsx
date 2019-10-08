// 3rd party libs
import React from 'react';

// ThingSPIN libs
// Models
import { itemClass } from '../types';

export interface TsAlarmStatItemProps {
  className?: string;
  icon?: string;
  unit?: string;
}

// use common class
const bcls = `${itemClass}-stats`;

const TsAlarmStatItem: React.FC<TsAlarmStatItemProps> = ({ icon = "fa fa-info", children, className, unit }) => (
  <div className={`${bcls} ${className ? className : ''}`}>
    <div className={`${bcls}-i`}>
      <i className={icon}></i>
    </div>
    <div className={`${bcls}-t`}>
      {children}
      {unit && (
        <span className={`${bcls}-t-unit`}>{unit}</span>
      )}
    </div>
  </div>
);

export default TsAlarmStatItem;
