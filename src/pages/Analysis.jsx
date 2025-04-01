import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiChevronDown, FiX } from "react-icons/fi";
import { FaFolder, FaFile } from "react-icons/fa";
import { migrationService } from "../api/migrationService";

const ProjectStructureView = ({ structure, isEditable, onStructureChange }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [activeFile, setActiveFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemType, setNewItemType] = useState(null); // 'file' or 'folder'
  const [newItemPath, setNewItemPath] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemData, setNewItemData] = useState({
    description: "",
    namespace: "",
    file_type: "jsx",
  });

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleFileDetails = (path) => {
    if (activeFile === path) {
      setActiveFile(null);
    } else {
      setActiveFile(path);
    }
  };

  const handleFileEdit = (filePath, fileData) => {
    setEditingFile({ path: filePath, data: fileData });
  };

  const handleFileSave = (filePath, updatedData) => {
    // Update the structure with the edited file data
    const newStructure = { ...structure };
    const pathSegments = filePath.split("/");
    let current = newStructure;

    // Handle root files
    if (
      pathSegments.length === 1 &&
      newStructure.root &&
      newStructure.root[pathSegments[0]]
    ) {
      newStructure.root[pathSegments[0]] = updatedData;
    } else {
      // Handle files in folders
      for (let i = 0; i < pathSegments.length - 1; i++) {
        if (current.folders && current.folders[pathSegments[i]]) {
          current = current.folders[pathSegments[i]];
        }
      }
      if (current.files) {
        current.files[pathSegments[pathSegments.length - 1]] = updatedData;
      }
    }
    onStructureChange(newStructure);
    setEditingFile(null);
  };

  const getFileData = (filePath) => {
    const pathSegments = filePath.split("/");
    let current = structure;

    // Handle root files
    if (
      pathSegments.length === 1 &&
      structure.root &&
      structure.root[pathSegments[0]]
    ) {
      return structure.root[pathSegments[0]];
    }

    // Handle files in folders
    for (let i = 0; i < pathSegments.length - 1; i++) {
      if (current.folders && current.folders[pathSegments[i]]) {
        current = current.folders[pathSegments[i]];
      }
    }
    return current.files
      ? current.files[pathSegments[pathSegments.length - 1]]
      : null;
  };

  const handleAddNew = (type, path = "") => {
    setNewItemType(type);
    setNewItemPath(path);
    setIsAddingNew(true);
  };

  const handleSaveNewItem = () => {
    const newStructure = { ...structure };
    const pathSegments = newItemPath.split("/").filter(Boolean);
    let current = newStructure;

    // Navigate to the correct location in the structure
    for (const segment of pathSegments) {
      if (current.folders && current.folders[segment]) {
        current = current.folders[segment];
      }
    }

    if (newItemType === "folder") {
      // Add new folder
      if (!current.folders) current.folders = {};
      current.folders[newItemName] = {
        files: {},
        folders: {},
      };
    } else {
      // Add new file
      if (!current.files) current.files = {};
      current.files[newItemName] = {
        description: newItemData.description,
        namespace: newItemData.namespace,
        file_type: newItemData.file_type,
        source_files: [],
      };
    }

    onStructureChange(newStructure);
    setIsAddingNew(false);
    setNewItemName("");
    setNewItemData({
      description: "",
      namespace: "",
      file_type: "jsx",
    });
  };

  const handleDelete = (path, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    const newStructure = { ...structure };
    const pathSegments = path.split("/");
    let current = newStructure;

    // Handle root files
    if (
      pathSegments.length === 1 &&
      newStructure.root &&
      newStructure.root[pathSegments[0]]
    ) {
      delete newStructure.root[pathSegments[0]];
    } else {
      // Handle files and folders in folders
      for (let i = 0; i < pathSegments.length - 1; i++) {
        if (current.folders && current.folders[pathSegments[i]]) {
          current = current.folders[pathSegments[i]];
        }
      }
      if (type === "file" && current.files) {
        delete current.files[pathSegments[pathSegments.length - 1]];
      } else if (type === "folder" && current.folders) {
        delete current.folders[pathSegments[pathSegments.length - 1]];
      }
    }
    onStructureChange(newStructure);
  };

  const renderAddNewForm = () => {
    return (
      <div className="ml-4 mt-4 mb-4 bg-blue-50 rounded-lg border border-blue-100 p-4 animate-fadeIn">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-700">
              Add New {newItemType === "folder" ? "Folder" : "File"}
            </h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-150"
            >
              <FiX className="h-4 w-4 text-blue-600" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={
                newItemType === "folder" ? "Folder Name" : "File Name"
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {newItemType === "file" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={newItemData.description}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      description: e.target.value,
                    })
                  }
                  placeholder="File description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Namespace
                </label>
                <input
                  type="text"
                  value={newItemData.namespace}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      namespace: e.target.value,
                    })
                  }
                  placeholder="File namespace"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File Type
                </label>
                <select
                  value={newItemData.file_type}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      file_type: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="jsx">JSX</option>
                  <option value="js">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="md">Markdown</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewItem}
              disabled={!newItemName}
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {newItemType === "folder" ? "Folder" : "File"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStructure = (data, currentPath = "") => {
    if (!data) return null;

    const folders = data.folders || {};
    const files = data.files || {};
    const rootFiles = data.root || {};

    const fileElements = Object.entries(files).map(([fileName, fileData]) => {
      const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;
      const isActive = activeFile === filePath;
      const isEditing = editingFile?.path === filePath;

      return (
        <div
          key={filePath}
          className={`flex items-center py-1 px-2 ${
            currentPath ? "ml-4" : ""
          } hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200 ${
            isActive ? "ring-2 ring-blue-200" : ""
          }`}
          onClick={() => toggleFileDetails(filePath)}
        >
          <span className="w-4" />
          <FaFile className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">{fileName}</span>
          {isEditable && (
            <div className="ml-auto flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileEdit(filePath, fileData);
                }}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-150"
              >
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(filePath, "file");
                }}
                className="p-1 hover:bg-red-100 rounded-full transition-colors duration-150"
              >
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    });

    const rootFileElements = Object.entries(rootFiles).map(
      ([fileName, fileData]) => {
        const filePath = fileName;
        const isActive = activeFile === filePath;
        const isEditing = editingFile?.path === filePath;

        return (
          <div
            key={filePath}
            className={`flex items-center py-1 px-2 hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200 ${
              isActive ? "ring-2 ring-blue-200" : ""
            }`}
            onClick={() => toggleFileDetails(filePath)}
          >
            <span className="w-4" />
            <FaFile className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">{fileName}</span>
            {isEditable && (
              <div className="ml-auto flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileEdit(filePath, fileData);
                  }}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-150"
                >
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(filePath, "file");
                  }}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors duration-150"
                >
                  <svg
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      }
    );

    // Render folders and subfolders recursively
    const folderElements = Object.entries(folders).map(
      ([folderName, folderData]) => {
        const folderPath = currentPath
          ? `${currentPath}/${folderName}`
          : folderName;
        const isExpanded = expandedNodes.has(folderPath);

        return (
          <div key={folderPath} className="ml-4">
            <div
              className="flex items-center py-1 px-2 hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200"
              onClick={() => toggleFolder(folderPath)}
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4 text-blue-600 mr-1" />
              ) : (
                <FiChevronRight className="h-4 w-4 text-blue-600 mr-1" />
              )}
              <FaFolder className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">{folderName}</span>
              {isEditable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(folderPath, "folder");
                  }}
                  className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors duration-150"
                >
                  <svg
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            {isExpanded && (
              <div className="ml-4 border-l border-blue-100 pl-2">
                {renderStructure(folderData, folderPath)}
              </div>
            )}
          </div>
        );
      }
    );

    return (
      <>
        {isEditable && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => handleAddNew("file", currentPath)}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add File
            </button>
            <button
              onClick={() => handleAddNew("folder", currentPath)}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Add Folder
            </button>
          </div>
        )}
        {rootFileElements}
        {fileElements}
        {folderElements}
        {isAddingNew && renderAddNewForm()}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {renderStructure(structure)}
      </div>

      {/* File Details/Edit Modal */}
      {(activeFile || editingFile) && (
        <div className="ml-4 mt-4 mb-4 bg-blue-50 rounded-lg border border-blue-100 p-4 animate-fadeIn">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-700">
                {editingFile ? "Edit File" : "File Details"}
              </h3>
              <button
                onClick={() => {
                  setActiveFile(null);
                  setEditingFile(null);
                }}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-150"
              >
                <FiX className="h-4 w-4 text-blue-600" />
              </button>
            </div>

            {editingFile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingFile.data.description}
                    onChange={(e) =>
                      setEditingFile({
                        ...editingFile,
                        data: {
                          ...editingFile.data,
                          description: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Namespace
                  </label>
                  <input
                    type="text"
                    value={editingFile.data.namespace}
                    onChange={(e) =>
                      setEditingFile({
                        ...editingFile,
                        data: {
                          ...editingFile.data,
                          namespace: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File Type
                  </label>
                  <input
                    type="text"
                    value={editingFile.data.file_type}
                    onChange={(e) =>
                      setEditingFile({
                        ...editingFile,
                        data: {
                          ...editingFile.data,
                          file_type: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingFile(null)}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleFileSave(editingFile.path, editingFile.data)
                    }
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 text-sm">
                {activeFile &&
                  (() => {
                    const fileData = getFileData(activeFile);
                    return fileData ? (
                      <>
                        <div className="flex items-start">
                          <span className="text-gray-500 w-28 flex-shrink-0">
                            Description:
                          </span>
                          <span className="text-gray-700">
                            {fileData.description}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 w-28 flex-shrink-0">
                            Namespace:
                          </span>
                          <span className="text-gray-700">
                            {fileData.namespace}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 w-28 flex-shrink-0">
                            Type:
                          </span>
                          <span className="text-gray-700">
                            {fileData.file_type}
                          </span>
                        </div>
                      </>
                    ) : null;
                  })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Analysis = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [targetReactVersion, setTargetReactVersion] = useState("18");
  const [instruction, setInstruction] = useState("");
  const [structure, setStructure] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputType, setInputType] = useState("url"); // "url" or "file"
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      setSelectedFile(file);
      setError("");
    } else {
      setSelectedFile(null);
      setError("Please select a valid ZIP file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError("");

    try {
      let result;
      if (inputType === "url") {
        if (!repoUrl) {
          setError("Please enter a GitHub repository URL");
          setIsAnalyzing(false);
          return;
        }
        result = await migrationService.analyzeGitHub(repoUrl);
      } else {
        if (!selectedFile) {
          setError("Please select a ZIP file");
          setIsAnalyzing(false);
          return;
        }
        result = await migrationService.analyzeZip(selectedFile);
      }

      setStructure(result.structure);
      setAnalysisResult(result.analysis);
      setProjectId(result.projectId);
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMigrate = async () => {
    if (!projectId || !structure) {
      setError("Please analyze the project first");
      return;
    }

    setIsMigrating(true);
    setError("");

    try {
      if (inputType === "url") {
        await migrationService.migrateFromGitHub(repoUrl);
      } else {
        await migrationService.migrateFromZip(selectedFile);
      }
      navigate("/result");
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsMigrating(false);
    }
  };

  const handleEditStructure = () => {
    setIsEditing(true);
  };

  const handleSaveStructure = async (updatedStructure) => {
    try {
      setIsMigrating(true);
      await migrationService.migrate(projectId, updatedStructure, true);
      setStructure(updatedStructure);
      setIsEditing(false);
      navigate("/result");
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

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

          {!analysisResult ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setInputType("url")}
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
                        <path
                          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                      </svg>
                      <span>GitHub URL</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType("file")}
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
                        <path
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
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
                          <path
                            d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.167 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </div>
                      <input
                        id="repoUrl"
                        type="text"
                        required
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
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
                  htmlFor="targetReactVersion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target React Version
                </label>
                <select
                  id="targetReactVersion"
                  value={targetReactVersion}
                  onChange={(e) => setTargetReactVersion(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                >
                  <option value="18">React 18</option>
                  <option value="17">React 17</option>
                  <option value="16">React 16</option>
                </select>
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
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Enter any specific instructions for the AngularJS to React migration..."
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  rows="4"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={
                    isAnalyzing ||
                    (inputType === "url" && !repoUrl) ||
                    (inputType === "file" && !selectedFile)
                  }
                  className={`w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]
                            ${
                              isAnalyzing ||
                              (inputType === "url" && !repoUrl) ||
                              (inputType === "file" && !selectedFile)
                                ? "bg-blue-300 cursor-not-allowed text-white/80"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl"
                            }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                      <span>Analyzing AngularJS Project...</span>
                    </div>
                  ) : (
                    "Start Analysis"
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
                        onStructureChange={handleSaveStructure}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMigrate}
                  disabled={isMigrating}
                  className={`w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]
                    ${
                      isMigrating
                        ? "bg-[#82c9d2] cursor-not-allowed text-white/80"
                        : "bg-gradient-to-r from-[#008597] to-[#007b8a] text-white hover:shadow-xl"
                    }`}
                >
                  {isMigrating ? (
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
