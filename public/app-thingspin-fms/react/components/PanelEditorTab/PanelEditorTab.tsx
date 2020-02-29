// Js 3rd party libs
import React from 'react';
import classNames from 'classnames';

// Grafana libs
import { PanelEditorTab } from 'app/features/dashboard/panel_editor/state/reducers';
import { Tooltip } from '@grafana/ui';


export interface TsTabItemParams {
  tab: PanelEditorTab;
  activeTab: string;
  onClick: (tab: PanelEditorTab) => void;
}

export function TsTabItem({ tab, activeTab, onClick }: TsTabItemParams) {
  const tabClasses = classNames({
    'panel-editor-tabs__link': true,
    active: activeTab === tab.id,
  });

  let icon = <i className={`gicon gicon-${tab.id}${activeTab === tab.id ? '-active' : ''}`} />;
  if (tab.id === 'analytics') {
    icon = <i className={`gicon gicon-advanced${activeTab === tab.id ? '-active' : ''}`} />;
  }

  return (
    <div className="panel-editor-tabs__item" onClick={() => onClick(tab)}>
      <a className={tabClasses} aria-label={`${tab.text} tab button`}>
        <Tooltip content={`${tab.text}`} placement="auto">
          {icon}
        </Tooltip>
      </a>
    </div>
  );
}
