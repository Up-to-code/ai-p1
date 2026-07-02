import React from 'react';
import { QentrahModal, ModalSize } from './QentrahModal';

export interface QentrahDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

export function QentrahDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  footer,
  showCloseButton = true,
}: QentrahDialogProps) {
  return (
    <QentrahModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
    >
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {children}
      {footer && (
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          {footer}
        </div>
      )}
    </QentrahModal>
  );
}
