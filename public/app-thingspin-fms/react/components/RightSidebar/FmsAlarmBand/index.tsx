// js 3rd party libs
import { Observable } from 'rxjs';
import React, { useState, useEffect } from 'react';

// Grafana libs
import { Switch } from '@grafana/ui';
import { liveSrv } from 'app/core/core';
import { dateTime } from '@grafana/data';

// Thingspin libs
import { AlarmPayload, WsStream } from './types';
import { setFieldData, fetchAlarms } from './models';
import { AlarmType } from 'app-thingspin-fms/pages/alarm/alarmHistory/types';
import { TsRightSideTabbarComponent, Props as TabProps } from '../RightSideTabbar';
import { TsRightSideHistoryComponent } from '../RightSideHistory';

const enable = {
    confirm: false
};
const dateFormat = "YYYY년 MM월 DD일";

export const FmsAlarmBandComp: React.FC<any> = (_) => {
    const [play, setPlay] = useState(true);
    const [list, setList] = useState([] as AlarmPayload[]);

    const [date, setDate] = useState(new Date());
    const [filters, setFilters] = useState([]);
    const [checked, setChecked] = useState(false);

    // Function component Life cycle

    useEffect(() => { //DidMount
        let liveObs: Observable<WsStream>;

        (async () => {
            await liveSrv.getConnection();
            liveObs = liveSrv.subscribe('ts-alarm');
            liveObs.subscribe(({ data }: WsStream) => {
                if (!play) {
                    return;
                }

                const filtered = [data].filter(({ time }: AlarmPayload): boolean =>
                    dateTime(date).format(dateFormat) === dateTime(time).format(dateFormat));

                list.unshift(...genData(filtered));
                setList([...list]);
            });
        })();

        // WillUnmount
        return () => liveObs && liveSrv.removeObserver('ts-alarm', liveObs);
    }, []);

    useEffect(() => { // DidUpdate & changed date/filters/checked
        (async () => {
            const dt = dateTime(date);
            const alarms = (await fetchAlarms(
                dt.startOf('day').valueOf(), // from
                dt.endOf('day').valueOf(), // to
                [AlarmType.ALERT, AlarmType.WARNING],
                checked,
            ));

            setList(genData(alarms));
        })();
    }, [date, filters, checked]);

    // Data Processing

    const genData = (data: AlarmPayload[]) => (data
        .filter(({ alarmType }: AlarmPayload): boolean => !filters.includes(alarmType))
        .map(setFieldData)
    );

    // Events

    const onPlay = (play: boolean) => setPlay(play);

    const onChangeDate = (date: Date) => setDate(date);

    const onChangeFilter = (filters: any[]) => setFilters([...filters]);

    const onChangeChecked = ({ target }: React.SyntheticEvent) => setChecked((target as HTMLInputElement).checked);

    // Views

    const tabProps: TabProps = {
        date,
        play,
        onPlay,
        filters,
        onChangeDate,
        onChangeFilter,
    };

    return <>
        <TsRightSideTabbarComponent {...tabProps} />
        <TsRightSideHistoryComponent list={list} checked={checked} />

        <div className="tsr-bottom">
            <div className="tsrb-left">
                <div>
                    <i className="tsi icon-ts-notifications_active"></i>
                    <span>알람 룰</span>
                </div>
                <div>
                    <i className="tsi icon-ts-foresight"></i>
                    <span>예지진단</span>
                </div>
            </div>
            { enable.confirm && <div>
                <Switch label="미확인" checked={checked} onChange={onChangeChecked} transparent />
            </div> }
        </div>

    </>;
};
