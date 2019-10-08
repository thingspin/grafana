// 3rd party libs
import React from 'react';

// thingspin libs
import { TS_ALARM_TYPE } from './index';

export enum TS_HISTORY_TYPE {
    PDM = 'pdm',
    ALARM = 'alarm',
}

export interface Props {
    data: any;
    alarmType: TS_ALARM_TYPE;
    historyType?: TS_HISTORY_TYPE;
    isActive: boolean;
}

function getHistoryIconClass(historyType: TS_HISTORY_TYPE) {
    switch (historyType) {
        case TS_HISTORY_TYPE.PDM:
            return `tsi icon-ts-foresight`;
        default:
            return `tsi icon-ts-notifications_active`;
    }
}

function renderInfo(key: string, value: string): React.ReactNode {
    return <div className="fms hist-info" key={key}>
        <span className="key">{`${key} : `}</span>
        <span className="value">{value}</span>
    </div>;
}

const FmsCard: React.FC<Props> = ({ data, alarmType, isActive, historyType }) => {
    const alrmTypeStr = alarmType ? alarmType : 'normal';
    const keys = Object.keys(data);

    return <div className={`fms-hist-info-card ${isActive ? `ts-${alrmTypeStr}-bg` : ''}`}>

        <div className="fms-hist-card-icon">
            <div className={`fms-hist-icon-layer ${isActive ? `ts-${alrmTypeStr}` : ''}`}>
                <i className={getHistoryIconClass(historyType)}></i>
            </div>
        </div>

        <div className="fms-hist-card-info">
            <div className="fms-hist-info-layer">
                {keys.map((key) => renderInfo(key, data[key]))}
            </div>
        </div>
    </div>;
};

export default FmsCard;
