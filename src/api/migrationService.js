import axios from "./axios";

const API_BASE = "/api/v1/migrator";

export const migrationService = {
  // Analyze GitHub repository
  analyzeGitHub: async (githubUrl) => {
    try {
      const response = await axios.post(`${API_BASE}/github/analyze`, {
        github_url: githubUrl,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Analyze ZIP file
  analyzeZip: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API_BASE}/zip/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Migrate from ZIP
  migrateFromZip: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API_BASE}/zip`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Perform migration with target structure
  migrate: async (projectId, targetStructure, changes) => {
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
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
