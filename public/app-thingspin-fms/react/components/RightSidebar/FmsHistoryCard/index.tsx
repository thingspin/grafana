// 3rd part libs
import React from 'react';
import classNames from 'classnames';

// Grafana libs
import { dateTime } from '@grafana/data';

// Thingspin React Compoonents
import FmsCard, { TS_HISTORY_TYPE } from './Card';

export enum TS_ALARM_TYPE {
    ERROR = "err",
    WARNING = "warn",
    NORMAL = "normal",
}

export interface Props {
    alarmType: TS_ALARM_TYPE;
    // title layer
    title?: string;
    subtitle?: string;

    // time layer
    time?: Date;
    link?: string;

    // card layer
    history: any;
    historyType?: TS_HISTORY_TYPE;

    // user ckecked
    isActive?: boolean;

    [etc: string]: any;
}

function getAlarmIconClass(alarmType: TS_ALARM_TYPE): string {
    switch (alarmType) {
        case TS_ALARM_TYPE.ERROR:
            return `tsi icon-ts-error1`;
        case TS_ALARM_TYPE.WARNING:
            return `tsi icon-ts-warning1`;
        default:
            return `tsi icon-ts-user-advanced`;
    }
}

const FmsHistoryCard: React.FC<Props> = ({ history, isActive, alarmType, link, historyType, time, title, subtitle }) => {
    const m = dateTime(time);
    const mainCls = classNames({
        'ts-on-bg': isActive,
        'ts-off-bg': !isActive,
    });

    return (<div className="fms-history-card">
        <div className={mainCls}>
            <div className="fms-tl-left">
                <div className={`fms-tl-icon ${isActive && `ts-${alarmType}`}`}>
                    <i className={getAlarmIconClass(alarmType)} />
                </div>
                <div className="fms-tl-dot" />
            </div>

            <div className="fms-tl-right">
                {title && <div className={`fms-tl-title ${isActive && `ts-${alarmType}`}`}>
                    {title}
                    {subtitle && <div className='fms-tl-subtitle'>
                        {subtitle}
                    </div>}
                </div>}

                <div className="fms-tl-time-layer">
                    <div>
                        {m.format("YYYY년 MM월 DD일(ddd) HH:mm:ss")}
                    </div>
                    <div>
                        <a href={link ? link : '#'} >상세보기 ></a>
                    </div>
                </div>

                <FmsCard data={history}
                    alarmType={alarmType}
                    historyType={historyType}
                    isActive={!!isActive} />
            </div>
        </div>
    </div>);
};

export default FmsHistoryCard;
