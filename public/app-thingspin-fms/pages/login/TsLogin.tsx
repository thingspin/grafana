// js 3rd party libs
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';

// Grafana libs
import config from 'app/core/config';
import { StoreState } from 'app/types';
import { AppEvents } from '@grafana/data';
import appEvents from 'app/core/app_events';
import { getBackendSrv } from '@grafana/runtime';

const isOauthEnabled = () => config.hasOwnProperty("oauth") &&  Object.keys(config.oauth).length > 0;

export interface FormModel {
  user: string;
  password: string;
  email: string;
}

interface Props {
  routeParams?: any;
  children: (props: {
    isLoggingIn: boolean;
    changePassword: (pw: string) => void;
    isChangingPassword: boolean;
    skipPasswordChange: Function;
    login: (data: FormModel) => void;
    disableLoginForm: boolean;
    ldapEnabled: boolean;
    authProxyEnabled: boolean;
    disableUserSignUp: boolean;
    isOauthEnabled: boolean;
    loginHint: string;
    passwordHint: string;
  }) => JSX.Element;
}

export const TsLogin: React.FC<Props> = ({ children, routeParams }) => {
  let isInited = false;
  let result: any = {};
  const backendSrv = getBackendSrv();

  if (!isInited) {
    isInited = true;

    if (config.loginError) {
      appEvents.emit(AppEvents.alertWarning, ['Login Failed', config.loginError]);
    }
  }

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const toThingspin = () => {
    const { appSubUrl } = config;
    const { redirectUrl } = result;
    const { redirect } = routeParams;

    const url = appSubUrl +
      (redirect && redirect[0] === '/') ? redirect
      : redirectUrl ? redirectUrl
        : '/';

    window.location.href = url;
  };

  const changePassword = async (newPassword: string) => {
    const pw = {
      newPassword,
      confirmNew: newPassword,
      oldPassword: 'admin',
    };

    try {
      await backendSrv.put('/api/user/password', pw);
      toThingspin();
    } catch (err) {
      console.error(err);
    }
  };

  const changeView = () => {
    setIsChangingPassword(true);
  };


  const login = async (formModel: FormModel) => {
    setIsLoggingIn(true);

    try {
      result = await backendSrv.post('/login', formModel);
      const caller = (formModel.password !== 'admin' || config.ldapEnabled || config.authProxyEnabled)
        ? toThingspin : changeView;
      caller();
    } catch (e) {
      setIsLoggingIn(false);
    }
  };

  const { loginHint, passwordHint, disableLoginForm, ldapEnabled, authProxyEnabled, disableUserSignUp } = config;

  return (
    <>
      {children({
        isOauthEnabled: isOauthEnabled(),
        loginHint,
        passwordHint,
        disableLoginForm,
        ldapEnabled,
        authProxyEnabled,
        disableUserSignUp,
        login,
        isLoggingIn,
        changePassword,
        skipPasswordChange: toThingspin,
        isChangingPassword,
      })}
    </>
  );
};

export const mapStateToProps = ({ location: { routeParams }}: StoreState) => ({
  routeParams,
});

export default hot(module)(
  connect(
    mapStateToProps,
  )(TsLogin)
);
