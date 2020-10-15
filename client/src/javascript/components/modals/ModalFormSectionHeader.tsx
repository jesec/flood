import React from 'react';

interface ModalFormSectionHeaderProps {
  children: React.ReactNode;
}

const ModalFormSectionHeader: React.FC<ModalFormSectionHeaderProps> = ({children}: ModalFormSectionHeaderProps) => {
  return <h2 className="h4">{children}</h2>;
};

export default ModalFormSectionHeader;
