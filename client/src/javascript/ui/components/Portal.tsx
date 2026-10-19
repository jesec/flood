import {FC, ReactNode, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal: FC<PortalProps> = ({children}: PortalProps) => {
  const [mountPoint] = useState(() => {
    const element = document.createElement('div');
    element.classList.add('portal');
    return element;
  });

  useEffect(() => {
    const appElement = document.getElementById('app');
    if (appElement == null) {
      document.body.appendChild(mountPoint);
    } else {
      appElement.appendChild(mountPoint);
    }

    return () => {
      if (appElement == null) {
        document.body.removeChild(mountPoint);
      } else {
        appElement.removeChild(mountPoint);
      }
    };
  }, [mountPoint]);

  return createPortal(children, mountPoint);
};

export default Portal;
