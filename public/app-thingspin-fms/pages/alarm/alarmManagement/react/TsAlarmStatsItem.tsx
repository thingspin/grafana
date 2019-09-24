// 3rd party libs
import React from 'react';

// ThingSPIN libs
// Models
import { itemClass } from '../types';

export interface TsAlarmStatItemProps {
  icon?: string;
}

// use common class
const bcls = `${itemClass}-stats`;

const TsAlarmStatItem: React.FC<TsAlarmStatItemProps> = ({ icon= "fa fa-info", children }): JSX.Element => {
  return (<div className={bcls}>
    <div className={`${bcls}-i`}>
      <i className={icon}></i>
    </div>
    <div className={`${bcls}-t`}>{children}</div>
  </div>);
};

export default TsAlarmStatItem;
