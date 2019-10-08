import React from 'react';

export enum ButtonColor {
  BLUE = "ts-btn-blue",
}

export interface ButtonProps {
  color?: ButtonColor;
  onClick: () => void;
}

const TopButton: React.FC<ButtonProps> = ({ color = ButtonColor.BLUE, onClick, children, }) => (
  <button
    className={`ts-top-button ${color}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TopButton;
