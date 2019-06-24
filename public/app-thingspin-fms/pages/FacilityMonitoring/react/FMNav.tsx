import { auto } from 'angular';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Grafana React Components
import { DashNav } from 'app/features/dashboard/components/DashNav/DashNav';
import { DashNavButton } from 'app/features/dashboard/components/DashNav/DashNavButton';
import { DashNavTimeControls } from 'app/features/dashboard/components/DashNav/DashNavTimeControls';
import { StoreState } from 'app/types';

// Grafana State
import { updateLocation } from 'app/core/actions';

// ThingSPIN Angular Services
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';

// Thingspin component libs
import { FMNavButton } from './FMNavButton';
import { updateFmMetaToggleTreeView } from '../redux/actions/FMAction';
import { store } from 'app/store/store';

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
        return (<>
            {this.isSettings && <span className="navbar-settings-title">&nbsp;/ Settings</span>}
            <div className="navbar__spacer" />
        </>);
    }

    openFacilityTree = (): void => {
        const { dashboard } = this.props;
        const meta: any = dashboard.meta;
        meta.viewTree = !meta.viewTree;
    };
    onFmTreeView() {
        (this.props as any).updateFmMetaToggleTreeView();
        this.forceUpdate();
    }

    // Override
    render(): JSX.Element {
        const { dashboard, location, editview } = this.props;
        const { snapshot, meta: { canStar, canSave, canShare, showSettings, isStarred, isEditing } } = dashboard;
        const meta = dashboard.meta as any;
        const snapshotUrl = snapshot && snapshot.originalUrl;

        const isTreeView = store.getState().thingspinFmMeta.isTreeView;
        const treeViewIconClassName = classNames({
            'fa': true,
            'fa-indent': !isTreeView,
            'fa-outdent': isTreeView,
        });

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
                    {!isEditing && !meta.isNew && !editview ? <DashNavButton
                        tooltip="설비 목록 열기"
                        classSuffix=""
                        icon={treeViewIconClassName}
                        onClick={this.onFmTreeView.bind(this)}
                    />: ''}

                    {canSave && (
                        <FMNavButton tooltip="Save dashboard" classSuffix="save" onClick={this.onSave} >
                            메뉴에 저장
                        </FMNavButton>
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
                        <div className="gf-timepicker-nav" ref={element => (this.timePickerEl = element)} />
                        <DashNavTimeControls dashboard={dashboard} location={location} updateLocation={updateLocation} />
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
    updateFmMetaToggleTreeView,
};

export default connect(mapStateToProps, mapDispatchToProps)(FMNavComp);
