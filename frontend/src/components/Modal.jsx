const Modal = ({ open, onClose, children, size = "default", scrollable = false }) => {
  if (!open) return null;
  const sizeClasses = size === "large" ? "max-w-xl w-full" : size === "xl" ? "max-w-2xl w-full" : "max-w-lg w-full";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col relative ${sizeClasses} mx-auto max-h-[90vh] overflow-hidden border border-slate-200/80`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-light transition-colors z-10"
          aria-label="Close"
        >
          ×
        </button>
        <div className={`flex-1 min-h-0 overflow-y-auto ${scrollable ? "py-2" : ""}`}>
          <div className={scrollable ? "px-6 pb-6 pt-2" : "p-8 pt-12"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
