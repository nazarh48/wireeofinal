import { useState } from 'react';

const ProjectNameModal = ({ isOpen, onClose, onSave, defaultName = '' }) => {
  const [projectName, setProjectName] = useState(defaultName);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!projectName.trim()) {
      setError('Project name cannot be empty');
      return;
    }
    if (projectName.trim().length < 3) {
      setError('Project name must be at least 3 characters');
      return;
    }
    onSave(projectName.trim());
    setProjectName('');
    setError('');
  };

  const handleClose = () => {
    setProjectName(defaultName);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Name Your Project</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setError('');
            }}
            placeholder="Enter project name (e.g., Smart Home Setup)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleClose();
            }}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectNameModal;
