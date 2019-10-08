// js 3rd party libs
import React, { useState } from 'react';

// Thingspin libs
import { TsRightSideTabbarComponent, Props as TabProps } from '../RightSideTabbar';
import { TsRightSideHistoryComponent, Props as HistoryProps } from '../RightSideHistory';

export const FmsAlarmBandComp: React.FC<any> = (_) => {
    const [play, setPlay] = useState(true);
    const [filters, setFilters] = useState([]);
    const [date, setDate] = useState(new Date());

    const onPlay = (play: boolean) => setPlay(play);

    const onChangeDate = (date: Date) => setDate(date);

    const onChangeFilter = (filters: any[]) => setFilters([...filters]);

    const baseProps = { filters, date, play, };
    const tabProps: TabProps = {
        ...baseProps,
        onPlay,
        onChangeDate,
        onChangeFilter,
    };
    const historyProps: HistoryProps = { ...baseProps };

    return <>
        <TsRightSideTabbarComponent {...tabProps} />
        <TsRightSideHistoryComponent {...historyProps} />
    </>;
};
