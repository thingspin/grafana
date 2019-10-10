// 3rd part libs
import React from 'react';
import classNames from 'classnames';

// Grafana libs
import { DateTime } from '@grafana/data';

// Thingspin React Compoonents
import FmsCard, { TS_HISTORY_TYPE } from './Card';
import { getBackendSrv } from '@grafana/runtime';

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
    time?: DateTime;
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
    const mainCls = classNames({
        'ts-on-bg': isActive,
        'ts-off-bg': !isActive,
    });

    const onClickDetail = async () => {
        const result = await getBackendSrv().put('/thingspin/annotations/confirm', { time: time.valueOf() });
        console.log(result);
    };

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
                        {time.format("YYYY년 MM월 DD일(ddd) HH:mm:ss")}
                    </div>
                    <div>
                        <a href={link ? link : '#'} onClick={onClickDetail} >상세보기 ></a>
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
