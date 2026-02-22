import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react-lite';

import UIStore from '@client/stores/UIStore';

export enum ApplicationViewModifier {
  AuthForm = 'auth-form',
}

interface ApplicationViewProps {
  children: ReactNode;
  modifier?: ApplicationViewModifier;
}

const ApplicationView: FC<ApplicationViewProps> = observer(({children, modifier}: ApplicationViewProps) => {
  const classes = classnames(
    'application__view',
    modifier != null && `application__view--${modifier}`,
    UIStore.isSidebarAlternativeState && 'application__view--sidebar-alternative-state',
  );

  return <div className={classes}>{children}</div>;
});

export default ApplicationView;
