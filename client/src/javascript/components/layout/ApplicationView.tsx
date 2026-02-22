import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react-lite';

import UIStore from '@client/stores/UIStore';

interface ApplicationViewProps {
  children: ReactNode;
  modifier?: string;
}

const ApplicationView: FC<ApplicationViewProps> = observer(({children, modifier}: ApplicationViewProps) => {
  const classes = classnames('application__view', {
    [`application__view--${modifier}`]: modifier != null,
    'application__view--sidebar-alternative-state': UIStore.isSidebarAlternativeState,
  });

  return <div className={classes}>{children}</div>;
});

export default ApplicationView;
