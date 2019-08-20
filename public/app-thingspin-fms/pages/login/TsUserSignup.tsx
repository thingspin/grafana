import React, { FC } from 'react';

export const TsUserSignup: FC<{}> = () => {
  return (
    <div className="login-signup-box">
      <div className="login-signup-title p-r-1">New to ThingSPIN?</div>
      <a href="signup" className="btn btn-medium btn-signup btn-p-x-2">
        Sign Up
      </a>
    </div>
  );
};
