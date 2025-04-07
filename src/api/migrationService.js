import axios from "./axios";

const API_BASE = "http://localhost:8000/api/v1/migrator";

export const migrationService = {
  // Analyze GitHub repository
  analyzeGitHub: async (githubUrl, instruction = "") => {
    try {
      const response = await axios.post(`${API_BASE}/github/analyze`, {
        github_url: githubUrl,
        instruction: instruction || undefined,
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
  analyzeZip: async (file, instruction = "") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (instruction) {
        formData.append("instruction", instruction);
      }
      
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
  migrateFromGitHub: async (githubUrl, instruction = "") => {
    try {
      const response = await axios.post(
        `${API_BASE}/github`,
        {
          github_url: githubUrl,
          instruction: instruction || undefined,
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
  migrateFromZip: async (file, instruction = "") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (instruction) {
        formData.append("instruction", instruction);
      }
      
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
  migrate: async (projectId, targetStructure, changes = false, instruction = "") => {
    try {
      const response = await axios.post(
        `${API_BASE}/migrate`,
        {
          project_id: projectId,
          target_structure: targetStructure,
          changes: changes,
          instruction: instruction || undefined,
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
