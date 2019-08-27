// 3rd party libs
import React, { FC } from 'react';
import { CSSTransition } from 'react-transition-group';

// Grafana Libs
import LoginCtrl from 'app/core/components/Login/LoginCtrl';
import { LoginServiceButtons } from 'app/core/components/Login/LoginServiceButtons';
import { ChangePassword } from 'app/core/components/Login/ChangePassword';

// ThingSPIN Libs
// Views
import { TsLoginForm } from './TsLoginForm';

// Customize LoginPage Function Component(app/core/components/Login/LoginPage.tsx)
export const TsLoginPage: FC = () => (
  <div className="login container">
    <div className="login-content">
      <div className="login-branding">
        <img className="logo-icon" src="public/img/thingspin/thingspin_icon.svg" alt="ThingSPIN" />
      </div>
      <LoginCtrl>
        {({
          loginHint,
          passwordHint,
          isOauthEnabled,
          ldapEnabled,
          authProxyEnabled,
          disableLoginForm,
          //disableUserSignUp,
          login,
          isLoggingIn,
          changePassword,
          skipPasswordChange,
          isChangingPassword,
        }) => (
          <div className="login-outer-box">
            <div className={`login-inner-box login-small-logo`}><img className={`login-small-logo`}
                    src="public/img/thingspin/thingspin_logo.svg" alt="ThingSPIN" /></div>
            <div className={`login-inner-box ${isChangingPassword ? 'hidden' : ''}`} id="login-view">
              {!disableLoginForm ? (
                <TsLoginForm
                  displayForgotPassword={!(ldapEnabled || authProxyEnabled)}
                  onSubmit={login}
                  loginHint={loginHint}
                  passwordHint={passwordHint}
                  isLoggingIn={isLoggingIn}
                />
              ) : null}
              {isOauthEnabled ? (
                <>
                  <div className="text-center login-divider">
                    <div>
                      <div className="login-divider-line" />
                    </div>
                    <div>
                      <span className="login-divider-text">{disableLoginForm ? null : <span>or</span>}</span>
                    </div>
                    <div>
                      <div className="login-divider-line" />
                    </div>
                  </div>
                  <div className="clearfix" />
                  <LoginServiceButtons />
                </>
              ) : null}
            </div>
            <CSSTransition
              appear={true}
              mountOnEnter={true}
              in={isChangingPassword}
              timeout={250}
              classNames="login-inner-box"
            >
              <ChangePassword onSubmit={changePassword} onSkip={skipPasswordChange} focus={isChangingPassword} />
            </CSSTransition>
          </div>
        )}
      </LoginCtrl>

      <div className="clearfix" />
    </div>
  </div>
);
