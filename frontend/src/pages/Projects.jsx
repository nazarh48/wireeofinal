import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { generateProjectPDF } from '../utils/pdfGenerator';
import ProjectNameModal from '../components/ProjectNameModal';

const FALLBACK_IMAGE = '/test.png';

const Projects = () => {
  const projects = useStore((state) => state.projects);
  const projectsLoading = useStore((state) => state.projectsLoading);
  const fetchProjects = useStore((state) => state.fetchProjects);
  const updateProjectName = useStore((state) => state.updateProjectName);
  const deleteProject = useStore((state) => state.deleteProject);
  const addProductsToPdf = useStore((state) => state.addProductsToPdf);
  const savePendingAsPdf = useStore((state) => state.savePendingAsPdf);
  const showToast = useStore((state) => state.showToast);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditName = (projectId, currentName) => {
    setEditingId(projectId);
    setEditingName(currentName);
  };

  const handleSaveName = (projectId) => {
    if (editingName.trim() && editingName.trim().length >= 3) {
      updateProjectName(projectId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleDownloadPDF = async (project) => {
    try {
      setLoadingPdf(project.id);
      if (!project?.products || project.products.length === 0) {
        alert('No products available to export.');
        setLoadingPdf(null);
        return;
      }
      await generateProjectPDF(project, { user });
      setLoadingPdf(null);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setLoadingPdf(null);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleAddProjectToPdf = (project) => {
    const added = addProductsToPdf(project?.products || []);
    if (added > 0) {
      showToast(
        `${added} product${added !== 1 ? 's' : ''} added to PDF configuration.`,
        'Save as PDF',
        savePendingAsPdf,
      );
    }
  };

  const userProjects = projects.map((project) => ({
    ...project,
    title: project.name,
    icon: '📋',
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Graphic Configurator</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage and export your electrical automation projects. Create, configure, and organize your custom system designs.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {projectsLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading projects…</p>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-8">Start creating your first electrical automation project by configuring products.</p>
              <Link
                to="/products/ranges"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Create Your First Project
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden group transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={project.image || project.products?.[0]?.baseImageUrl || FALLBACK_IMAGE}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 text-4xl">{project.icon}</div>
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Professional Project
                    </div>
                  </div>

                  <div className="p-6">
                    {editingId === project.id ? (
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName(project.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveName(project.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.name || project.title}
                      </h3>
                    )}

                    <p className="text-gray-600 text-sm mb-4">
                      {project.description || 'Electrical automation project configuration'}
                    </p>

                    {project.products && project.products.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Products ({project.products.length})
                        </p>
                        <ul className="space-y-1">
                          {project.products.slice(0, 3).map((product, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center">
                              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                              {product.name || product.baseProductName || 'Product'}
                            </li>
                          ))}
                          {project.products.length > 3 && (
                            <li className="text-xs text-gray-500 italic">
                              +{project.products.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleEditName(project.id, project.name)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>

                    {project.products?.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAddProjectToPdf(project)}
                          className="w-full bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Project to PDF
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(project)}
                          disabled={loadingPdf === project.id}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          {loadingPdf === project.id ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Export Project PDF
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {userProjects.length > 0 && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Create Another Project?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Configure more electrical automation products and organize them into new projects.
            </p>
            <Link
              to="/products/ranges"
              className="inline-flex items-center bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Create New Project
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      <ProjectNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(name) => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Projects;