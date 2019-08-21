import React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@grafana/ui';

export interface PanelEditorTab {
  id: string;
  text: string;
}

export interface TabItemParams {
  tab: PanelEditorTab;
  activeTab: string;
  onClick: (tab: PanelEditorTab) => void;
}

export default function TabItem({ tab, activeTab, onClick }: TabItemParams) {
  const tabClasses = classNames({
    'panel-editor-tabs__link': true,
    active: activeTab === tab.id,
  });

  return (
    <div className="panel-editor-tabs__item" onClick={() => onClick(tab)}>
      <a className={tabClasses} aria-label={`${tab.text} tab button`}>
        <Tooltip content={`${tab.text}`} placement="auto">
          <i className={`gicon gicon-${tab.id}${activeTab === tab.id ? '-active' : ''}`} />
        </Tooltip>
      </a>
    </div>
  );
}
