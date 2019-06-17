import { auto } from 'angular';
import React from 'react';
import { connect } from 'react-redux';

// Grafana React Components
import { DashNav } from 'app/features/dashboard/components/DashNav/DashNav';
import { DashNavButton } from 'app/features/dashboard/components/DashNav/DashNavButton';
import { DashNavTimeControls } from 'app/features/dashboard/components/DashNav/DashNavTimeControls';
import { StoreState } from 'app/types';

// Grafana State
import { updateLocation } from 'app/core/actions';

// ThingSPIN Angular Services
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';

// Facaility Monitoring Navigation Component
// (Customized grafana react component: iiHOC)
export class FMNavComp extends DashNav {
    // Override
    onSave = (): void => {
        const { $injector }: { $injector: auto.IInjectorService } = this.props;
        const dashboardSrv: TsDashboardSrv = $injector.get('dashboardSrv');
        dashboardSrv.fmSaveFM();
    };

    // Override
    renderDashboardTitleSearchButton(): JSX.Element {
        return (
            <>
                {this.isSettings && <span className="navbar-settings-title">&nbsp;/ Settings</span>}
                <div className="navbar__spacer" />
            </>
        );
    }

    // Override
    render(): JSX.Element {
        const { dashboard, location } = this.props;
        const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
        const { snapshot } = dashboard;
        const snapshotUrl = snapshot && snapshot.originalUrl;

        return (
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

                    {canSave && (
                        <DashNavButton tooltip="Save dashboard" classSuffix="save" icon="fa fa-save" onClick={this.onSave} />
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
                        <div className="gf-timepicker-nav" ref={element => (this.timePickerEl = element)} />
                        <DashNavTimeControls dashboard={dashboard} location={location} updateLocation={updateLocation} />
                    </div>
                )}
            </div>
        );
    }

}

const mapStateToProps = (state: StoreState) => ({
    location: state.location,
});

const mapDispatchToProps = {
    updateLocation,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FMNavComp);
