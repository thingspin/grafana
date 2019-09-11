// 3rd party libs
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';

// Grafana libs
// Models
import { StoreState } from 'app/types';
// Views
import { DashNav } from 'app/features/dashboard/components/DashNav/DashNav';
import { DashNavButton } from 'app/features/dashboard/components/DashNav/DashNavButton';
import { DashNavTimeControls } from 'app/features/dashboard/components/DashNav/DashNavTimeControls';
// Controllers
import { updateLocation } from 'app/core/actions';
import { appEvents } from 'app/core/core';

// ThingSPIN libs
// Views
// Angular Directives or Components
import { AlarmDashboardSrv } from '../angularjs/services/tsDashboardSrv';
// React Components
import { AlarmNavButton } from './AlarmNavButton';
import { BackendSrv } from 'app/core/services/backend_srv';

// Alarm Monitoring Navigation Component
// (Customized grafana react component: iiHOC)
export class AlarmNavComp extends DashNav {
    protected backendSrv: BackendSrv = this.props.$injector.get("backendSrv");
    protected $location: angular.ILocationService = this.props.$injector.get("$location");

    // Override
    onSave = (): void => {
        const { $injector }: { $injector: angular.auto.IInjectorService } = this.props;
        const dashboardSrv: AlarmDashboardSrv = $injector.get('dashboardSrv');
        dashboardSrv.alarmSaveDashboard();
    };

    // Override
    renderDashboardTitleSearchButton(): JSX.Element {
        return (<>
            {this.isSettings && <span className="navbar-settings-title">&nbsp;/ Settings</span>}
            <div className="navbar__spacer" />
        </>);
    }

    // Thingspin add func
    deleteDashboard = () => {
        const { dashboard } = this.props;
        const text2 = dashboard.title;

        if (dashboard.meta.provisioned) {
            appEvents.emit('confirm-modal', {
                title: 'Cannot delete provisioned dashboard',
                text: `해당 알람은 초기 설정(프로비저닝)에서 관리되어 삭제할 수 없습니다. 자세한 내용은 시스템 관리자에게 문의바랍니다.`,
                icon: 'fa-trash',
                noText: '확인',
            });
            return;
        }

        appEvents.emit('confirm-modal', {
            title: 'Delete',
            text: '정말 해당 알람을 삭제시겠습니까?',
            text2: text2,
            icon: 'fa-trash',
            yesText: '삭제',
            onConfirm: () => {
                dashboard.meta.canSave = false;
                this.deleteDashboardConfirmed();
            },
        });
    }

    // thingspin add func
    deleteDashboardConfirmed() {
        const { dashboard } = this.props;
        this.backendSrv.deleteDashboard(dashboard.uid, false).then(() => {
            appEvents.emit('alert-success', ['Dashboard Deleted', dashboard.title + ' has been deleted']);
            this.$location.url('/');
        });
    }

    // Override
    render(): JSX.Element {
        const { dashboard, location, $injector } = this.props;
        const { snapshot, meta: { canStar, canSave, canShare, isStarred } } = dashboard;
        const meta = dashboard.meta as any;
        const snapshotUrl = snapshot && snapshot.originalUrl;

        return (<>
            <div className="navbar">
                {this.isInFullscreenOrSettings && this.renderBackButton()}
                {this.renderDashboardTitleSearchButton()}

                {this.playlistSrv.isPlaying && (
                    <div className="navbar-buttons navbar-buttons--playlist">
                        <DashNavButton
                            tooltip="Go to previous dashboard"
                            classSuffix="tight"
                            icon="fa fa-step-backward"
                            onClick={this.onPlaylistPrev}
                        />
                        <DashNavButton
                            tooltip="Stop playlist"
                            classSuffix="tight"
                            icon="fa fa-stop"
                            onClick={this.onPlaylistStop}
                        />
                        <DashNavButton
                            tooltip="Go to next dashboard"
                            classSuffix="tight"
                            icon="fa fa-forward"
                            onClick={this.onPlaylistNext}
                        />
                    </div>
                )}

                <div className="navbar-buttons navbar-buttons--actions">
                    {canSave &&  (
                        <AlarmNavButton tooltip="신규 알람 생성" classSuffix="save" onClick={this.onSave} >
                            {meta.isNew ? '신규 생성' : '수정'}
                        </AlarmNavButton>
                    )}

                    {!meta.isNew &&  (
                        <AlarmNavButton tooltip="알람 삭제" classSuffix="save" onClick={this.deleteDashboard} >
                            삭제
                        </AlarmNavButton>
                    )}

                    {canStar && (
                        <DashNavButton
                            tooltip="Mark as favorite"
                            classSuffix="star"
                            icon={`${isStarred ? 'fa fa-star' : 'fa fa-star-o'}`}
                            onClick={this.onStarDashboard}
                        />
                    )}

                    {canShare && (
                        <DashNavButton
                            tooltip="Share dashboard"
                            classSuffix="share"
                            icon="fa fa-share-square-o"
                            onClick={this.onOpenShare}
                        />
                    )}


                    {snapshotUrl && (
                        <DashNavButton
                            tooltip="Open original dashboard"
                            classSuffix="snapshot-origin"
                            icon="gicon gicon-link"
                            href={snapshotUrl}
                        />
                    )}
                </div>

                {!dashboard.timepicker.hidden && (
                    <div className="navbar-buttons">
                        <DashNavTimeControls
                        $injector={$injector}
                        dashboard={dashboard}
                        location={location}
                        updateLocation={updateLocation}
                        />
                    </div>
                )}
            </div>
        </>);
    }

}

const mapStateToProps = ({location}: StoreState) => ({
    location,
});

const mapDispatchToProps = {
    updateLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(AlarmNavComp);
