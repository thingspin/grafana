// js 3rd party libs
import React from 'react';

// Grafana libs
import { Tooltip } from '@grafana/ui';
import { ChangePassword } from 'app/core/components/Login/ChangePassword';

export class TsChangePassword extends ChangePassword {
  private tsUserInput: HTMLInputElement;

  // override
  focus() {
    this.tsUserInput.focus();
  }

  render() {
    return (
      <div className="login-inner-box" id="change-password-view">
        <div className="text-left login-change-password-info">
          <h5>비밀번호를 변경하세요.</h5>
          ThingSPIN을 사용하기전에 <br />비밀번호를 변경하여 계정 보안에 신경써주세요.
          <br />
          이후에도 비밀번호 변경이 가능합니다.
        </div>
        <form className="login-form-group gf-form-group">
          <div className="login-form">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="gf-form-input login-form-input"
              required
              placeholder="New password"
              onChange={this.onNewPasswordChange}
              ref={input => {
                this.tsUserInput = input;
              }}
            />
          </div>
          <div className="login-form">
            <input
              type="password"
              name="confirmNew"
              className="gf-form-input login-form-input"
              required
              ng-model="command.confirmNew"
              placeholder="Confirm new password"
              onChange={this.onConfirmPasswordChange}
            />
          </div>
          <div className="login-button-group login-button-group--right text-right">
            <Tooltip
              placement="bottom"
              content="If you skip you will be prompted to change password next time you login."
            >
              <a className="btn btn-link" onClick={this.onSkip}>
                Skip
              </a>
            </Tooltip>

            <button
              type="submit"
              className={`btn btn-large p-x-2 ${this.state.valid ? 'btn-primary' : 'btn-inverse'}`}
              onClick={this.onSubmit}
              disabled={!this.state.valid}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }
}
