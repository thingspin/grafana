// reference public/app/types/events.ts
// Grafana libs
import { eventFactory } from '@grafana/data';
import { SaveDashboardPayload } from 'app/types/events';

export const tsRefresh = eventFactory('ts-refresh');

export const toggleSidemenu = eventFactory('toggle-sidemenu');

export const toggleRightSidebar = eventFactory('toggle-right-sidebar');

export const tsChangeViewmode = eventFactory<number>('ts-change-viewmode');

export const tsUpdateAlarm = eventFactory<any>('ts-update-alarm');

export const saveAlarmDashboard = eventFactory<SaveDashboardPayload>('save-alarm-dashboard');

export const saveFmDashboard = eventFactory<SaveDashboardPayload>('save-fm-dashboard');
