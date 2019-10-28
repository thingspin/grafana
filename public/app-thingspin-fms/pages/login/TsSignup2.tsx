// JS 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';

// Grafana libs
import config from 'app/core/config';
import { getBackendSrv } from '@grafana/runtime';

export interface Props {
  $injector: angular.auto.IInjectorService;
}

export interface States {
  verifyEmailEnabled: boolean;
  autoAssignOrg: boolean;
  code: string;
  orgName: string;
  username: string;
  password: string;
  name: string;
  email: string;
}

export class TsSignUp extends React.PureComponent<any, States> {
  protected $location: angular.ILocationService;
  backendSrv = getBackendSrv();

  state = {
    verifyEmailEnabled: false,
    autoAssignOrg: false,
    code: '',
    username: '',
    password: '',
    orgName: '',
    name: '',
    email: '',
  };

  constructor(props: Props) {
    super(props);
    this.$location = props.$injector.get("$location");

    const { email, code } = this.$location.search();

    // validate email is semi ok
    if (email && !email.match(/^\S+@\S+$/)) {
      console.error('invalid email');
      return;
    }

    this.state.orgName = email;
    this.state.email = email;
    this.state.username = email;
    this.state.code = code;
  }

  get formModel() {
    const { orgName, email, username, code, name } = this.state;
    return {
      orgName,
      email,
      username,
      code,
      name,
    };
  }

  get validForm() {
    const { username, name, password } = this.state;

    return username && name && password;
  }

  async componentDidMount() {
    const { verifyEmailEnabled, autoAssignOrg } = await this.backendSrv.get('/api/user/signup/options');
    this.setState({ verifyEmailEnabled, autoAssignOrg });
  }

  onSubmit = async () => {
    if (!this.validForm) {
      return;
    }

    const { code }: any = await this.backendSrv.post('/api/user/signup/step2', this.formModel);
    location.href = config.appSubUrl + (code === 'redirect-to-select-org') ? '/profile/select-org?signup=1' : '/';
  }

  onGotoBack = () => {
    history.back();
  }

  handleInputChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({ [name]: value, } as any);
  }

  render() {
    const { verifyEmailEnabled, autoAssignOrg, code, orgName, username, name, password } = this.state;
    return (
      <div className="login container">
        <div className="login-content">
          <div className="login-branding">
            <img className="logo-icon" src="public/img/thingspin/thingspin_icon.svg" alt="ThingSPIN" />
          </div>
          <div className="login-outer-box">
            <div className="signup">
              <div className="ts-signup-area">
                <img src="public/img/thingspin/titleicon.svg" />
                <span className="ts-signup-title">회원가입</span>
              </div>
              <div className="p-b-1">
                계정을 만들기 위해 아래 정보를 입력해주세요.
              </div>

              <form name="signUpForm" className="login-form gf-form-group ts-signup-form">
                {verifyEmailEnabled &&
                  <div className="gf-form">
                    <span className="gf-form-label width-9">
                      Email code
                      {/* Email code<tip>Email verification code (sent to your email)</tip> */}
                    </span>
                    <input type="text" className="gf-form-input max-width-14"
                      name="code" value={code} onChange={this.handleInputChange} required />
                  </div>
                }

                {!autoAssignOrg &&
                  <div className="gf-form">
                    <span className="gf-form-label width-9">조직 이름</span>
                    <input type="text" className="gf-form-input max-width-14" placeholder="Name your organization"
                      name="orgName" value={orgName} onChange={this.handleInputChange} />
                  </div>
                }

                <div className="gf-form">
                  <span className="gf-form-label width-9">이름</span>
                  <input type="text" className="gf-form-input max-width-14" placeholder="Name"
                    name="name" value={name} onChange={this.handleInputChange} />
                </div>
                <div className="gf-form">
                  <span className="gf-form-label width-9">이메일</span>
                  <input type="text" className="gf-form-input max-width-14" placeholder="Email"
                    name="username" value={username} onChange={this.handleInputChange} required />
                </div>
                <div className="gf-form">
                  <span className="gf-form-label width-9">비밀번호</span>
                  <input type="password" className="gf-form-input max-width-14" placeholder="Password"
                    name="password" value={password} onChange={this.handleInputChange} required />
                </div>

                <div className="gf-form-button-row-signup">
                  {this.validForm && <button type="submit" className="btn ts-reset-button-submit" onClick={this.onSubmit} ng-disabled="!signUpForm.$valid">
                    가입신청
                  </button>
                  }
                  <a href="#" className="btn ts-reset-button-back" onClick={this.onGotoBack}>뒤로가기</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default hot(module)(TsSignUp);
