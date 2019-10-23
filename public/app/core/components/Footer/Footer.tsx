import React, { FC } from 'react';
import { Tooltip } from '@grafana/ui';

interface Props {
  appName: string;
  buildVersion: string;
  buildCommit: string;
  newGrafanaVersionExists: boolean;
  newGrafanaVersion: string;
}

export const Footer: FC<Props> = React.memo(
  ({ appName, buildVersion, buildCommit, newGrafanaVersionExists, newGrafanaVersion }) => {
    return (
      <div>
        {/*
          <footer className="footer">
            <div className="text-center">
              <ul>
                <li>
                  <a href="http://thingspin.io/doc" target="_blank" rel="noopener">
                    <i className="fa fa-file-code-o" /> Docs
                  </a>
                </li>
                <li>
                  <a href="http://thingspin.io/services/support" target="_blank" rel="noopener">
                    <i className="fa fa-support" /> Support Plans
                  </a>
                </li>
                <li>
                  <a href="http://thingspin.io/community" target="_blank" rel="noopener">
                    <i className="fa fa-comments-o" /> Community
                  </a>
                </li>
                <li>
                  <a href="http://thingspin.io/version" target="_blank" rel="noopener">
                    ThingSPIN
                  </a>{' '}
                  <span>
                    v3.0
                  </span>
                </li>
                {newGrafanaVersionExists && (
                  <li>
                    <Tooltip placement="auto" content={newGrafanaVersion}>
                      <a href="http://thingspin.io/download" target="_blank" rel="noopener">
                        New version available!
                      </a>
                    </Tooltip>
                  </li>
                )}
              </ul>
            </div>
          </footer>
                */}
      </div>
    );
  }
);

export default Footer;
