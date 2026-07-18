import {FC, ReactNode, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal: FC<PortalProps> = ({children}: PortalProps) => {
  const mountPoint = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = document.createElement('div');
    container.classList.add('portal');
    mountPoint.current = container;

    const appElement = document.getElementById('app');
    if (appElement == null) {
      document.body.appendChild(container);
    } else {
      appElement.appendChild(container);
    }
    setIsReady(true);

    return () => {
      if (appElement == null) {
        document.body.removeChild(container);
      } else {
        appElement.removeChild(container);
      }
    };
  }, []);

  if (!isReady || mountPoint.current == null) return null;

  return createPortal(children, mountPoint.current);
};

export default Portal;
