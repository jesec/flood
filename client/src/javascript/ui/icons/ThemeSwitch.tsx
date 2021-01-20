import classnames from 'classnames';
import {FC, memo} from 'react';

interface ThemeSwitchProps {
  className?: string;
}

// Material Design : brightness_6 - Apache 2.0
const ThemeSwitch: FC<ThemeSwitchProps> = memo(({className}: ThemeSwitchProps) => (
  <svg className={classnames('icon', 'icon--theme-switch', className)} viewBox="0 0 60 60">
    <path d="M0,0h60v60H0V0z" fill="none" />
    <path
      d="M50,38.3l8.3-8.3L50,21.7V10H38.3L30,1.7L21.7,10H10v11.7L1.7,30l8.3,8.3V50h11.7l8.3,8.3l8.3-8.3H50C50,50,50,38.3,50,38.3
z M30,45V15c8.3,0,15,6.7,15,15S38.3,45,30,45z"
    />
  </svg>
));

ThemeSwitch.defaultProps = {
  className: undefined,
};

export default ThemeSwitch;
