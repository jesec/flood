import classnames from 'classnames';
import {FC, memo} from 'react';

interface MenuProps {
  className?: string;
}

const Menu: FC<MenuProps> = memo(({className}: MenuProps) => (
  <svg className={classnames('icon', 'icon--menu', className)} viewBox="0 0 60 60">
    <path d="M 7.5 45 L 52.5 45 L 52.5 40 L 7.5 40 Z M 7.5 32.5 L 52.5 32.5 L 52.5 27.5 L 7.5 27.5 Z M 7.5 15 L 7.5 20 L 52.5 20 L 52.5 15 Z M 7.5 15" />
  </svg>
));

Menu.defaultProps = {
  className: undefined,
};

export default Menu;
