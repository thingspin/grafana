// 3rd party libs
import React from 'react';

// Grafana libs
// Views
import { LoginForm } from 'app/core/components/Login/LoginForm';

// ThingSPIN libs
// Views
import { TsUserSignup } from './TsUserSignup';

export class TsLoginForm extends LoginForm {
  disableUserSignUp = false;

  // Override
  render() {
    const { loginHint, passwordHint, isLoggingIn } = this.props;

    return (
      <form name="loginForm" className="login-form-group gf-form-group">
        <div className="login-form">
          <input
            ref={input => { this.userInput = input; }}
            type="text"
            name="user"
            className="gf-form-input login-form-input"
            required
            placeholder={loginHint}
            aria-label="Username input field"
            onChange={this.onChangeUsername}
          />
        </div>

        <div className="login-form">
          <input
            type="password"
            name="password"
            className="gf-form-input login-form-input"
            required
            ng-model="formModel.password"
            id="inputPassword"
            placeholder={passwordHint}
            aria-label="Password input field"
            onChange={this.onChangePassword}
          />
        </div>

        <div className="login-button-group">
          {this.props.displayForgotPassword ? (
            <div className="small login-button-forgot-password">
              <a href="user/password/send-reset-email">비밀번호를 잊으셨나요?</a>
            </div>
          ) : null}

          <TsUserSignup />

          {!isLoggingIn ? (
            <button
              type="submit"
              aria-label="Login button"
              className="btn btn-medium btn-signup btn-p-x-2"
              onClick={this.onSubmit}
              disabled={!this.state.valid}
            >
              로그인
            </button>
          ) : (
            <button type="submit" className="btn btn-large p-x-2 btn-inverse btn-loading">
              로그인중<span>.</span>
              <span>.</span>
              <span>.</span>
            </button>
          )}
        </div>
      </form>
    );
  }
}
