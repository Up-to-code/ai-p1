import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useQentrahTheme } from '../theme';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

export interface QentrahModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  small: 'max-w-[30%]',
  medium: 'max-w-[70%]',
  large: 'max-w-[90%]',
  fullscreen: 'max-w-[100%] h-[100vh]',
};

export function QentrahModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}: QentrahModalProps) {
  const theme = useQentrahTheme();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className={`relative bg-card text-card-foreground rounded-lg shadow-lg w-full ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: theme.colors.card,
          color: theme.colors['card-foreground'],
          maxHeight: size === 'fullscreen' ? '100vh' : '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: theme.colors.border,
            }}
          >
            <h2 className="text-xl font-semibold">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                style={{
                  color: theme.colors['muted-foreground'],
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
