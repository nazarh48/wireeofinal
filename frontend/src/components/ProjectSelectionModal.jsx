import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

const ProjectSelectionModal = ({ isOpen, onClose, products, onConfirm }) => {
  const projects = useStore((s) => s.projects) || [];
  const projectsLoading = useStore((s) => s.projectsLoading);
  const projectsError = useStore((s) => s.projectsError);
  const fetchProjects = useStore((s) => s.fetchProjects);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) fetchProjects();
  }, [isOpen, fetchProjects]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId('');
      setNewProjectName('');
      setIsCreatingNew(false);
      setSubmitting(false);
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLocalError('');
    if (isCreatingNew && newProjectName.trim()) {
      setSubmitting(true);
      try {
        await onConfirm(products, null, newProjectName.trim());
        onClose();
        setSelectedProjectId('');
        setNewProjectName('');
        setIsCreatingNew(false);
      } catch (err) {
        setLocalError(err?.message || 'Failed to create project');
      } finally {
        setSubmitting(false);
      }
    } else if (selectedProjectId) {
      setSubmitting(true);
      try {
        await onConfirm(products, selectedProjectId);
        onClose();
        setSelectedProjectId('');
        setNewProjectName('');
        setIsCreatingNew(false);
      } catch (err) {
        setLocalError(err?.message || 'Failed to add products to project');
      } finally {
        setSubmitting(false);
      }
    } else {
      setLocalError('Select a project or enter a new project name.');
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedProjectId('');
    setNewProjectName('');
    setIsCreatingNew(false);
  };

  const productsCount = Array.isArray(products) ? products.length : 0;
  const canSubmit = isCreatingNew
    ? newProjectName.trim().length > 0
    : !!selectedProjectId;
  const submitDisabled = submitting || productsCount === 0 || !canSubmit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Add {productsCount} Product{productsCount !== 1 ? 's' : ''} to Project
          </h2>
          <p className="text-gray-600 mt-1">
            Select an existing project or create a new one
          </p>
        </div>

        <div className="p-6 space-y-6">
          {localError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {localError}
            </div>
          )}
          {/* Create New Project Option */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={isCreatingNew}
                onChange={() => {
                  setIsCreatingNew(true);
                  setSelectedProjectId('');
                }}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg font-semibold text-gray-900">Create New Project</span>
            </label>
            {isCreatingNew && (
              <div className="mt-3 ml-8">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            )}
          </div>

          {/* Existing Projects */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer mb-4">
              <input
                type="radio"
                checked={!isCreatingNew}
                onChange={() => {
                  setIsCreatingNew(false);
                  setNewProjectName('');
                }}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg font-semibold text-gray-900">Select Existing Project</span>
            </label>
            {!isCreatingNew && (
              <div className="ml-8 space-y-2 max-h-64 overflow-y-auto">
                {projectsLoading ? (
                  <div className="py-4 text-gray-500 text-sm">Loading projects…</div>
                ) : projectsError ? (
                  <div className="py-4 text-sm text-red-600">
                    {projectsError}
                    <button
                      type="button"
                      onClick={fetchProjects}
                      className="ml-3 text-blue-600 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-gray-500 italic py-4">No projects created yet</p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        selectedProjectId === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="project"
                        value={project.id}
                        checked={selectedProjectId === project.id}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">
                          {project.products?.length || 0} product{project.products?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Products Preview */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Products to add:</h3>
            <div className="space-y-1">
              {productsCount === 0 ? (
                <div className="text-sm text-gray-500 italic">No products selected</div>
              ) : (
                products.map((product) => (
                  <div key={product._instanceId || product.id} className="text-sm text-gray-600 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{product.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitDisabled}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding…' : 'Add to Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
