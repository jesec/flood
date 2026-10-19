import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react-lite';

import UIStore from '@client/stores/UIStore';

export enum ApplicationViewModifier {
  AuthForm = 'auth-form',
  SidebarAlternativeState = 'sidebar-alternative-state',
}

interface ApplicationViewProps {
  children: ReactNode;
  modifier?: ApplicationViewModifier;
}

const ApplicationView: FC<ApplicationViewProps> = observer(({children, modifier}: ApplicationViewProps) => {
  const activeModifiers: Array<ApplicationViewModifier> = [];

  if (modifier != null) {
    activeModifiers.push(modifier);
  }

  if (UIStore.isSidebarAlternativeState) {
    activeModifiers.push(ApplicationViewModifier.SidebarAlternativeState);
  }

  const classes = classnames(
    'application__view',
    ...activeModifiers.map((activeModifier) => `application__view--${activeModifier}`),
  );

  return <div className={classes}>{children}</div>;
});

export default ApplicationView;
