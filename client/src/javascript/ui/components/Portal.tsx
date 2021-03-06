import {FC, ReactNode, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal: FC<PortalProps> = ({children}: PortalProps) => {
  const mountPoint = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountPoint.current = document.createElement('div');
    mountPoint.current.classList.add('portal');
    document.body.appendChild(mountPoint.current);

    return () => {
      if (mountPoint.current != null) {
        ReactDOM.unmountComponentAtNode(mountPoint.current);
        document.body.removeChild(mountPoint.current);
      }
    };
  }, []);

  if (mountPoint.current == null) return null;

  return ReactDOM.createPortal(children, mountPoint.current);
};

export default Portal;
