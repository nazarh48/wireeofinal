const Toast = ({ message, actionLabel, onAction, onClose, position = 'bottom' }) => (
  <div
    className={`fixed ${position === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white px-6 py-4 shadow-lg z-50 flex items-center justify-between transition-all duration-500 ease-in-out`}
  >
    <span className="flex-1 text-lg font-medium">{message}</span>
    <div className="flex items-center space-x-3">
      {actionLabel && (
        <button
          onClick={onAction}
          className="bg-white text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold border border-white hover:bg-gray-100 hover:border-gray-200 transition-colors duration-200"
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl font-bold transition-colors duration-200"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
);

export default Toast;
