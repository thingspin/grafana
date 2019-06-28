// 3rd part libs
import React, { PureComponent, ReactNode } from 'react';
import classNames from 'classnames';
// tslint:disable-next-line: import-blacklist
import moment from 'moment';

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
}

export interface States {
    isShow?: boolean;
    isActive?: boolean;
}

export default class FmsHistoryCard extends PureComponent<Props, States> {
    state: States = {
        isShow: true,
        isActive: !!this.props.isActive,
    };

    getAlarmIconClass(): string {
        const { alarmType } = this.props;

        switch (alarmType) {
            case TS_ALARM_TYPE.ERROR:
                return `tsi icon-ts-error1`;
            case TS_ALARM_TYPE.WARNING:
                return `tsi icon-ts-warning1`;
            default:
                return `tsi icon-ts-user-advanced`;
        }
    }

    viewDetail() {
        alert('준비중입니다.');
    }

    get renderSubTitle(): ReactNode {
        const { subtitle } = this.props;

        return (subtitle ? <div className='fms-tl-subtitle'>
            {subtitle}
        </div> : '');
    }

    get renderTitle(): ReactNode {
        const { title, alarmType } = this.props;
        const { isActive } = this.state;
        const colorCls = isActive ? `ts-${alarmType}` : '';

        return (<>
            {title ? <div className={`fms-tl-title ${colorCls}`}>
                {title}
                {this.renderSubTitle}
            </div> : ''}
        </>);
    }

    get renderLeftIcon(): ReactNode {
        const { alarmType } = this.props;
        const { isActive } = this.state;
        const colorCls = isActive ? `ts-${alarmType}` : '';

        return <div className="fms-tl-left">
            <div className={`fms-tl-icon ${colorCls}`}>
                <i className={this.getAlarmIconClass()}></i>
            </div>
            <div className="fms-tl-dot"></div>
        </div>;
    }

    get renderHistoryInfo(): ReactNode {
        const { history, time, link, alarmType, historyType } = this.props;
        const { isActive } = this.state;
        const m = moment(time);

        return <div className={`fms-tl-right`}>
            {this.renderTitle}
            <div className="fms-tl-time-layer">
                <div>
                    {m.format("YYYY년 MM월 DD일(ddd) HH:mm:ss")}
                </div>
                <div>
                    <a href={link} onClick={this.viewDetail}>상세보기 ></a>
                </div>
            </div>
            <FmsCard data={history}
                alarmType={alarmType}
                historyType={historyType}
                isActive={!!isActive} />
        </div>;
    }

    render(): ReactNode {
        const { isActive, isShow } = this.state;
        const mainCls = classNames({
            'ts-on-bg': isActive,
            'ts-off-bg': !isActive,
        });

        return (isShow ? <div className={`fms-history-card`}>
            <div className={mainCls}>
                {this.renderLeftIcon}
                {this.renderHistoryInfo}
            </div>
        </div>: '');
    }
}
