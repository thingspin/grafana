// 3rd party libs
import React from 'react';
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

// ThingSPIN libs
// Views
// Angular Directives or Components
import { AlarmDashboardSrv } from '../angularjs/services/tsDashboardSrv';
// React Components
import { AlarmNavButton } from './AlarmNavButton';

// Alarm Monitoring Navigation Component
// (Customized grafana react component: iiHOC)
export class AlarmNavComp extends DashNav {
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

    // Override
    render(): JSX.Element {
        const { dashboard, location, $injector } = this.props;
        const { snapshot, meta: { canStar, canSave, canShare, showSettings, isStarred } } = dashboard;
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
                        <AlarmNavButton tooltip="알람 저장" classSuffix="save" onClick={this.onSave} >
                            {meta.isNew ? '신규 생성' : '수정'}
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

                    {showSettings && (
                        <DashNavButton
                            tooltip="Dashboard settings"
                            classSuffix="settings"
                            icon="gicon gicon-cog"
                            onClick={this.onOpenSettings}
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
