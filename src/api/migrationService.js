import axios from "./axios";

const API_BASE = "http://localhost:8000/api/v1/migrator";

export const migrationService = {
  // Analyze GitHub repository
  analyzeGitHub: async (githubUrl) => {
    try {
      const response = await axios.post(`${API_BASE}/github/analyze`, {
        github_url: githubUrl,
      });
      return {
        structure: response.data.target_structure,
        analysis: response.data.analysis_results,
        projectId: response.data.project_id
      };
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Analyze ZIP file
  analyzeZip: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post(`${API_BASE}/zip/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        structure: response.data.target_structure,
        analysis: response.data.analysis_results,
        projectId: response.data.project_id
      };
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Migrate from GitHub
  migrateFromGitHub: async (githubUrl) => {
    try {
      const response = await axios.post(
        `${API_BASE}/github`,
        {
          github_url: githubUrl,
        },
        {
          responseType: "blob",
        }
      );
      // Create a download link for the ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'migrated-project.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Migrate from ZIP
  migrateFromZip: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post(`${API_BASE}/zip`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: "blob",
      });
      // Create a download link for the ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'migrated-project.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },

  // Perform migration with target structure
  migrate: async (projectId, targetStructure, changes = false) => {
    try {
      const response = await axios.post(
        `${API_BASE}/migrate`,
        {
          project_id: projectId,
          target_structure: targetStructure,
          changes: changes,
        },
        {
          responseType: "blob",
        }
      );
      // Create a download link for the ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'migrated-project.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      throw error.response?.data?.detail || error.message;
    }
  },
};
