// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';

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

export default class FmsCard extends PureComponent<Props> {
    getHistoryIconClass() {
        const { historyType } = this.props;

        switch (historyType) {
            case TS_HISTORY_TYPE.PDM:
                return `tsi icon-ts-foresight`;
            default:
                return `tsi icon-ts-notifications_active`;
        }
    }
    renderInfo(key: string, value: string): ReactNode {
        return <div className="fms hist-info" key={key}>
            <span className="key">{`${key} : `}</span>
            <span className="value">{value}</span>
        </div>;
    }

    render(): ReactNode {
        const { data, alarmType, isActive } = this.props;
        const alrmTypeStr = alarmType ? alarmType : 'normal';

        const bg = isActive ? `ts-${alrmTypeStr}-bg` : '';
        const color = isActive ? `ts-${alrmTypeStr}` : '';

        const mainCls = `fms-hist-info-card ${bg}`;
        const iconCls = `fms-hist-icon-layer ${color}`;

        const keys = Object.keys(data);

        return <div className={mainCls}>

            <div className="fms-hist-card-icon">
                <div className={iconCls}>
                    <i className={this.getHistoryIconClass()}></i>
                </div>
            </div>

            <div className="fms-hist-card-info">
                <div className="fms-hist-info-layer">
                    { keys.map((key) => this.renderInfo(key, data[key])) }
                </div>
            </div>
        </div>;
    }
}
