import {observer} from 'mobx-react';
import React from 'react';

import Modal from '../Modal';
import UIStore from '../../../stores/UIStore';

const ConfirmModal: React.FC = () => {
  if (UIStore.activeModal?.id !== 'confirm') {
    return null;
  }

  const {actions, content, heading} = UIStore.activeModal || {};

  return (
    <Modal
      actions={actions}
      alignment="center"
      content={<div className="modal__content">{content}</div>}
      heading={heading}
    />
  );
};

export default observer(ConfirmModal);
