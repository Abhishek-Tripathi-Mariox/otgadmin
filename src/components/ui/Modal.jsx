import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, title, children, onClose, actions = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer with Actions */}
        {actions && (
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
