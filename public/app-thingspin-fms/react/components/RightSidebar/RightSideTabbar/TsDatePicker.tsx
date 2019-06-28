// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';
import Calendar from 'react-calendar';
// tslint:disable-next-line: import-blacklist
import moment from 'moment';

export interface Props {
    onChange?: (date) => void;
}

export interface States {
    date?: Date;
    isShow: boolean;
}


export default class TsDatePciker extends PureComponent<Props, States> {
    state: States = {
        date: new Date(),
        isShow: false,
    };

    onChange(date) {
        const { onChange } = this.props;
        if (onChange) {
            onChange(date);
        }

        this.setState({ date });
        this.showToggle();
    }

    showToggle() {
        const { isShow } = this.state;
        this.setState({ isShow: !isShow });
    }

    setToday() {
        this.setState({ date: new Date() });
    }

    moveDay(value) {
        const { date } = this.state;
        date.setDate(date.getDate() + value);

        this.setState({ date: new Date(date) });
    }

    viewCalendar() {
        const { isShow } = this.state;
        this.setState({ isShow: !isShow });
    }

    render(): ReactNode {
        const { isShow, date } = this.state;

        return (<div className="ts-date-picker">
            <button className={`dp-btn ts-date ${isShow ? 'active' : ''}`}
                onClick={this.viewCalendar.bind(this)}>{moment(date).format("YYYY년 MM월 DD일(ddd)")}</button>

            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, -1)}>
                <i className="tsi icon-ts-chevron_left"></i>
            </button>
            <button className="dp-btn day-shift" onClick={this.moveDay.bind(this, 1)}>
                <i className="tsi icon-ts-chevron_right"></i>
            </button>
            <button className="dp-btn today" onClick={this.setToday.bind(this)}>오늘</button>

            {isShow ?
                <div className="ts-calendar">
                    <Calendar onChange={this.onChange.bind(this)} value={date} />
                </div>
                : ''}
        </div>);
    }
}
