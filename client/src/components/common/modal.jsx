import Button from "./Button";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl relative">
        <div>
          {title && <h2 className="text-xl font-semibold mb-1">{title}</h2>}
          <div className="text-sm text-gray-500">Preview</div>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
