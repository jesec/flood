import {FC, ReactNode} from 'react';

interface ModalFormSectionHeaderProps {
  children: ReactNode;
}

const ModalFormSectionHeader: FC<ModalFormSectionHeaderProps> = ({children}: ModalFormSectionHeaderProps) => (
  <h2 className="h4">{children}</h2>
);

export default ModalFormSectionHeader;
