import React, { useState } from "react";
import { FiChevronRight, FiChevronDown, FiX } from "react-icons/fi";
import { FaFolder, FaFile } from "react-icons/fa";

export const ProjectStructureView = ({
  structure,
  isEditable,
  onStructureChange,
}) => {
  const [expandedNodes, setExpandedNodes] = useState(
    new Set(["src", "public"])
  ); // Pre-expand some common folders
  const [activeFile, setActiveFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemType, setNewItemType] = useState(null); // 'file' or 'folder'
  const [newItemPath, setNewItemPath] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [rawDependenciesInput, setRawDependenciesInput] = useState("");
  const [rawSourceFilesInput, setRawSourceFilesInput] = useState("");
  const [editingRawDependenciesInput, setEditingRawDependenciesInput] =
    useState("");
  const [editingRawSourceFilesInput, setEditingRawSourceFilesInput] =
    useState("");
  const [newItemData, setNewItemData] = useState({
    description: "",
    file_type: "js",
    dependencies: [],
    source_files: [],
    migration_complexity: "low",
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
    // Ensure source_files is an array
    const data = {
      ...fileData,
      source_files: Array.isArray(fileData.source_files)
        ? fileData.source_files
        : [],
    };
    setEditingFile({ path: filePath, data });
    setEditingRawDependenciesInput(data.dependencies?.join(", ") || "");
    setEditingRawSourceFilesInput(data.source_files?.join(", ") || "");
  };

  const handleFileSave = (filePath, updatedData) => {
    // Clone the structure for immutability
    const newStructure = JSON.parse(JSON.stringify(structure));

    // Navigate to the file based on its path
    const pathSegments = filePath.split("/");
    let current = newStructure;

    // Navigate through the structure to find the file
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]];
      if (!current) return; // Path doesn't exist
    }

    // Process dependencies and source files
    const dependencies = editingRawDependenciesInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const source_files = editingRawSourceFilesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Update the file data
    const fileName = pathSegments[pathSegments.length - 1];
    if (current[fileName]) {
      current[fileName] = {
        ...updatedData,
        dependencies: dependencies,
        source_files: source_files,
        file_name: fileName,
        relative_path: filePath,
      };
    }

    onStructureChange(newStructure);
    setEditingFile(null);
  };

  const getFileData = (filePath) => {
    const pathSegments = filePath.split("/");
    let current = structure;

    // Navigate through the structure to find the file
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]];
      if (!current) return null; // Path doesn't exist
    }

    const fileName = pathSegments[pathSegments.length - 1];
    return current[fileName];
  };

  const handleAddNew = (type, path = "") => {
    setNewItemType(type);
    setNewItemPath(path);
    setIsAddingNew(true);
    // Reset the form data
    setNewItemName("");
    setRawDependenciesInput("");
    setRawSourceFilesInput("");
    setNewItemData({
      description: "",
      file_type: "js",
      dependencies: [],
      source_files: [],
      migration_complexity: "low",
    });
  };

  const handleSaveNewItem = () => {
    // Clone the structure for immutability
    const newStructure = JSON.parse(JSON.stringify(structure));

    // Navigate to the parent location based on the path
    const pathSegments = newItemPath.split("/").filter(Boolean);
    let current = newStructure;

    // Navigate through the structure to the parent folder
    for (const segment of pathSegments) {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }

    // Process dependencies and source files
    const dependencies = rawDependenciesInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const source_files = rawSourceFilesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Add the new item
    if (newItemType === "folder") {
      current[newItemName] = {};
    } else {
      current[newItemName] = {
        file_name: newItemName,
        file_type: newItemData.file_type,
        description: newItemData.description,
        dependencies: dependencies,
        source_files: source_files,
        relative_path: `${newItemPath}/${newItemName}`.replace(/^\//, ""),
        migration_complexity: newItemData.migration_complexity || "low",
        migration_suggestions: {
          code_transformation: "",
          potential_challenges: [],
          manual_review_required: false,
          performance_considerations: "",
        },
      };
    }

    onStructureChange(newStructure);
    setIsAddingNew(false);
    setNewItemName("");
    setRawDependenciesInput("");
    setRawSourceFilesInput("");
    setNewItemData({
      description: "",
      file_type: "js",
      dependencies: [],
      source_files: [],
      migration_complexity: "low",
    });
  };

  const handleDelete = (path, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    // Clone the structure for immutability
    const newStructure = JSON.parse(JSON.stringify(structure));

    // Navigate to the parent folder
    const pathSegments = path.split("/");
    let current = newStructure;

    // Handle top-level items
    if (pathSegments.length === 1) {
      delete newStructure[pathSegments[0]];
      onStructureChange(newStructure);
      return;
    }

    // Navigate to the parent folder
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]];
      if (!current) return; // Path doesn't exist
    }

    // Delete the item
    delete current[pathSegments[pathSegments.length - 1]];
    onStructureChange(newStructure);
  };

  const [rawInput, setRawInput] = useState(""); // Temporary input field state

  const handleInputChange = (e) => {
    setRawInput(e.target.value); // Allows free typing
  };

  const handleAddFiles = () => {
    if (!rawInput.trim()) return;

    const newFiles = rawInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean); // Remove empty values

    if (newFiles.length > 0) {
      setNewItemData((prevData) => ({
        ...prevData,
        source_files: [
          ...(Array.isArray(prevData.source_files)
            ? prevData.source_files
            : []),
          ...newFiles,
        ],
      }));
      setRawInput(""); // Reset input field
    }
  };

  const renderAddNewForm = () => {
    return (
      <div className="ml-4 mt-4 mb-4 bg-blue-50 rounded-lg border border-blue-100 p-4">
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
                  <option value="js">JavaScript</option>
                  <option value="jsx">JSX</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                  <option value="md">Markdown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Migration Complexity
                </label>
                <select
                  value={newItemData.migration_complexity}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      migration_complexity: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dependencies (comma separated)
                </label>
                <input
                  type="text"
                  value={rawDependenciesInput}
                  onChange={(e) => setRawDependenciesInput(e.target.value)}
                  placeholder="react, react-dom, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source Files (comma separated)
                </label>
                <input
                  type="text"
                  value={rawSourceFilesInput}
                  onChange={(e) => setRawSourceFilesInput(e.target.value)}
                  placeholder="Enter source files, separated by commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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

  // Recursively check if an object is a file (has file_name property)
  const isFile = (obj) => {
    return obj && typeof obj === "object" && "file_name" in obj;
  };

  // Recursive function to render the structure
  const renderStructure = (data, currentPath = "") => {
    if (!data || typeof data !== "object") return null;

    // Arrays to hold the JSX elements for files and folders
    const fileElements = [];
    const folderElements = [];

    // Process each item in the current data object
    Object.entries(data).forEach(([key, value]) => {
      const itemPath = currentPath ? `${currentPath}/${key}` : key;

      // Check if this is a file or a folder
      if (isFile(value)) {
        // This is a file
        const isActive = activeFile === itemPath;
        const isEditing = editingFile?.path === itemPath;

        fileElements.push(
          <div
            key={itemPath}
            className={`flex items-center py-1 px-2 ${
              currentPath ? "ml-4" : ""
            } hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200 ${
              isActive ? "ring-2 ring-blue-200" : ""
            }`}
            onClick={() => toggleFileDetails(itemPath)}
          >
            <span className="w-4" />
            <FaFile className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">
              {value.file_name || key}
            </span>
            {isEditable && (
              <div className="ml-auto flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileEdit(itemPath, value);
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
                    handleDelete(itemPath, "file");
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
      } else if (typeof value === "object") {
        // This is a folder (or potentially has nested files/folders)
        const isExpanded = expandedNodes.has(itemPath);

        folderElements.push(
          <div key={itemPath} className={currentPath ? "ml-4" : ""}>
            <div
              className="flex items-center py-1 px-2 hover:bg-blue-50 rounded cursor-pointer transition-colors duration-200"
              onClick={() => toggleFolder(itemPath)}
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4 text-blue-600 mr-1" />
              ) : (
                <FiChevronRight className="h-4 w-4 text-blue-600 mr-1" />
              )}
              <FaFolder className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">{key}</span>
              {isEditable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(itemPath, "folder");
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
                {renderStructure(value, itemPath)}
              </div>
            )}
          </div>
        );
      }
    });

    return (
      <>
        {isEditable && currentPath === "" && (
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
        {isEditable && currentPath !== "" && (
          <div className="flex space-x-2 mt-2 mb-2">
            <button
              onClick={() => handleAddNew("file", currentPath)}
              className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
            >
              <svg
                className="h-3 w-3 mr-1"
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
              className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
            >
              <svg
                className="h-3 w-3 mr-1"
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
        {fileElements}
        {folderElements}
        {isAddingNew && currentPath === newItemPath && renderAddNewForm()}
      </>
    );
  };

  const renderFileDetails = () => {
    if (!activeFile && !editingFile) return null;

    const fileData = editingFile ? editingFile.data : getFileData(activeFile);
    if (!fileData) return null;

    return (
      <div className="ml-4 mt-4 mb-4 bg-blue-50 rounded-lg border border-blue-100 p-4">
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
                  value={editingFile.data.description || ""}
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
                  File Type
                </label>
                <input
                  type="text"
                  value={editingFile.data.file_type || ""}
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dependencies (comma separated)
                </label>
                <input
                  type="text"
                  value={editingRawDependenciesInput}
                  onChange={(e) =>
                    setEditingRawDependenciesInput(e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source Files (comma separated)
                </label>
                <input
                  type="text"
                  value={editingRawSourceFilesInput}
                  onChange={(e) =>
                    setEditingRawSourceFilesInput(e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Migration Complexity
                </label>
                <select
                  value={editingFile.data.migration_complexity || "low"}
                  onChange={(e) =>
                    setEditingFile({
                      ...editingFile,
                      data: {
                        ...editingFile.data,
                        migration_complexity: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
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
              {activeFile && fileData && (
                <>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      Description:
                    </span>
                    <span className="text-gray-700">
                      {fileData.description || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      File Type:
                    </span>
                    <span className="text-gray-700">
                      {fileData.file_type || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      Dependencies:
                    </span>
                    <span className="text-gray-700">
                      {fileData.dependencies?.length
                        ? fileData.dependencies.join(", ")
                        : "None"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      Source Files:
                    </span>
                    <span className="text-gray-700">
                      {Array.isArray(fileData.source_files) &&
                      fileData.source_files.length
                        ? fileData.source_files.join(", ")
                        : "None"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      Migration:
                    </span>
                    <span
                      className={`text-gray-700 font-medium ${
                        fileData.migration_complexity === "high"
                          ? "text-red-600"
                          : fileData.migration_complexity === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {fileData.migration_complexity || "N/A"}
                    </span>
                  </div>

                  {fileData.migration_suggestions && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-1">
                        Migration Suggestions
                      </h4>
                      {fileData.migration_suggestions.code_transformation && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Code Transformation:
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {fileData.migration_suggestions.code_transformation}
                          </p>
                        </div>
                      )}
                      {fileData.migration_suggestions.potential_challenges
                        ?.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Potential Challenges:
                          </span>
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                            {fileData.migration_suggestions.potential_challenges.map(
                              (challenge, index) => (
                                <li key={index}>{challenge}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {fileData.migration_suggestions
                        .manual_review_required && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Manual Review Required
                          </span>
                          <p className="text-sm text-red-600 mt-1">Yes</p>
                        </div>
                      )}
                      {fileData.migration_suggestions
                        .performance_considerations && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Performance Considerations:
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {
                              fileData.migration_suggestions
                                .performance_considerations
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        {renderStructure(structure)}
        {renderFileDetails()}
      </div>
    </div>
  );
};
