import { useState } from "react";
import { migrationService } from "../api/migrationService";
import { ProjectStructureView } from "../components/ProjectStructureView";
import { toast } from "react-toastify"; // Assuming toast is imported from react-toastify

const Analysis = () => {
  // Consolidated state management
  const [inputValues, setInputValues] = useState({
    repoUrl: "",
    targetReactVersion: "18",
    instruction: "",
    selectedFile: null,
    inputType: "url", // "url" or "file"
  });

  const [projectData, setProjectData] = useState({
    structure: null,
    projectId: null,
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    error: "",
    isEditing: false,
  });

  // Destructure for convenience
  const { repoUrl, instruction, selectedFile, inputType } = inputValues;
  const { structure, projectId } = projectData;
  const { isLoading, error, isEditing } = uiState;

  // Validation check
  const isValidInput =
    inputType === "url" ? Boolean(repoUrl) : Boolean(selectedFile);

  // Update field helper
  const updateField = (field, value) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      updateField("selectedFile", file);
      setUiState((prev) => ({ ...prev, error: "" }));
    } else {
      updateField("selectedFile", null);
      setUiState((prev) => ({
        ...prev,
        error: "Please select a valid ZIP file",
      }));
    }
  };

  const setStructure = (structure) => {
    // set structre in projectData
    setProjectData((prev) => ({ ...prev, structure }));
  };

  const handleAnalysis = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));

      let result;
      if (inputType === "url") {
        if (!repoUrl) {
          setUiState((prev) => ({
            ...prev,
            error: "Please enter a GitHub repository URL",
            isLoading: false,
          }));
          return;
        }
        result = await migrationService.analyzeGitHub(repoUrl);
      } else {
        if (!selectedFile) {
          setUiState((prev) => ({
            ...prev,
            error: "Please select a ZIP file",
            isLoading: false,
          }));
          return;
        }
        result = await migrationService.analyzeZip(selectedFile);
      }

      setProjectData({
        structure: result.structure || result, // Handle both result formats
        projectId: result.projectId || null,
      });
    } catch (error) {
      setUiState((prev) => ({ ...prev, error: error.toString() }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleMigration = async () => {
    if (!isValidInput) {
      setUiState((prev) => ({
        ...prev,
        error: "Please provide valid input for migration",
      }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));

      let result;
      if (inputType === "url") {
        result = await migrationService.migrateFromGitHub(repoUrl);
      } else {
        result = await migrationService.migrateFromZip(selectedFile);
      }

      // Trigger file download with the response
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "react-migration.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Show success message
      toast.success("Migration completed successfully! File downloaded.");

      // Reset the state to go back to initial view
      setProjectData({ structure: null, projectId: null });
      setInputValues({
        repoUrl: "",
        targetReactVersion: "18",
        instruction: "",
        selectedFile: null,
        inputType: "url",
      });
    } catch (error) {
      const errorMessage = error.toString();
      setUiState((prev) => ({ ...prev, error: errorMessage }));
      toast.error("Migration failed: " + errorMessage);
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAnalysis();
  };

  const handleEditStructure = () => {
    setUiState((prev) => ({ ...prev, isEditing: true }));
  };

  const handleSaveStructure = async (updatedStructure) => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));
      await migrationService.migrate(projectId, updatedStructure, true);
      setProjectData((prev) => ({ ...prev, structure: updatedStructure }));
      setUiState((prev) => ({ ...prev, isEditing: false }));
    } catch (error) {
      setUiState((prev) => ({ ...prev, error: error.toString() }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancelEdit = () => {
    setUiState((prev) => ({ ...prev, isEditing: false }));
  };

  // Loading spinner component for reuse
  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              AngularJS to React Migration
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your AngularJS application into a modern React
              application with our intelligent migration tool
            </p>
          </div>

          {!projectData.projectId ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => updateField("inputType", "url")}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      inputType === "url"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                      </svg>
                      <span>GitHub URL</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("inputType", "file")}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      inputType === "file"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                      <span>ZIP File</span>
                    </div>
                  </button>
                </div>

                {inputType === "url" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="repoUrl"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Repository URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.167 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </div>
                      <input
                        id="repoUrl"
                        type="text"
                        required
                        value={repoUrl}
                        onChange={(e) => updateField("repoUrl", e.target.value)}
                        placeholder="https://github.com/username/angularjs-project"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="zipFile"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Upload ZIP File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
                      <div className="space-y-3 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="h-8 w-8 text-blue-600"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="zipFile"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="zipFile"
                              name="zipFile"
                              type="file"
                              accept=".zip"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          ZIP file up to 10MB
                        </p>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Selected file: {selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="instruction"
                  className="block text-sm font-medium text-gray-700"
                >
                  Migration Instructions
                </label>
                <textarea
                  id="instruction"
                  value={instruction}
                  onChange={(e) => updateField("instruction", e.target.value)}
                  placeholder="Enter any specific instructions for the AngularJS to React migration..."
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  rows="4"
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  type="button"
                  onClick={handleAnalysis}
                  disabled={isLoading || !isValidInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner />
                      Analyzing...
                    </span>
                  ) : (
                    "Start Analysis"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleMigration}
                  disabled={isLoading || !isValidInput}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner />
                      Migrating...
                    </span>
                  ) : (
                    "Start Migration"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-green-800">
                      Analysis Complete
                    </h3>
                    <p className="text-green-700 mt-1">
                      The target React structure has been generated. You can
                      review and edit it before proceeding with the conversion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleEditStructure}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Review & Edit Target Structure
                </button>

                {isEditing && (
                  <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Target Structure
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveStructure(structure)}
                          className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors duration-150"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <ProjectStructureView
                        structure={structure}
                        isEditable={isEditing}
                        onStructureChange={setStructure}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMigration}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]
                    ${
                      isLoading
                        ? "bg-[#82c9d2] cursor-not-allowed text-white/80"
                        : "bg-gradient-to-r from-[#008597] to-[#007b8a] text-white hover:shadow-xl"
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                      <span>Converting to React...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Convert to React
                    </>
                  )}
                </button>
              </div>
              {projectData.projectId && (
                <button
                  type="button"
                  onClick={() => {
                    setProjectData({ structure: null, projectId: null });
                    setInputValues((prev) => ({
                      ...prev,
                      repoUrl: "",
                      selectedFile: null,
                    }));
                  }}
                  className="px-4 py-2 mt-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Go Back to Start
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
