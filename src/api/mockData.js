export const mockProjectStructure = {
  folders: {
    src: {
      folders: {
        components: {
          files: {
            "App.jsx": {
              description: "Main React application component",
              file_type: "jsx",
              namespace: "src/components",
              source_files: ["App.css"],
            },
          },
        },
        pages: {
          files: {
            "Analysis.jsx": {
              description: "Analysis page component",
              file_type: "jsx",
              namespace: "src/pages",
              source_files: [],
            },
          },
        },
      },
      files: {
        "main.jsx": {
          description: "Application entry point",
          file_type: "jsx",
          namespace: "src",
          source_files: [],
        },
      },
    },
  },
};

export const mockAnalysisResult = {
  status: "completed",
  summary: {
    total_files: 15,
    analyzed_files: 12,
    migration_ready: 8,
    needs_attention: 4,
  },
  recommendations: [
    {
      file: "src/components/App.jsx",
      type: "component",
      suggestion: "Convert AngularJS $scope to React useState hooks",
      priority: "high",
    },
    {
      file: "src/pages/Analysis.jsx",
      type: "page",
      suggestion:
        "Replace AngularJS services with React context or custom hooks",
      priority: "medium",
    },
  ],
};

export const mockMigrationStatus = {
  status: "in_progress",
  progress: 65,
  current_file: "src/components/App.jsx",
  completed_files: 8,
  total_files: 12,
};

export const mockTargetStructure = {
  root: {
    "package.json": {
      description: "Project dependencies and scripts",
      namespace: "root",
      file_type: "json",
      source_files: ["package.json"],
    },
    "README.md": {
      description: "Project documentation",
      namespace: "root",
      file_type: "markdown",
      source_files: ["README.md"],
    },
  },
  folders: {
    src: {
      folders: {
        components: {
          files: {
            "App.jsx": {
              description: "Main application component",
              namespace: "components",
              file_type: "jsx",
              source_files: ["app.js"],
            },
            "Header.jsx": {
              description: "Application header component",
              namespace: "components",
              file_type: "jsx",
              source_files: ["header.js"],
            },
            "Footer.jsx": {
              description: "Application footer component",
              namespace: "components",
              file_type: "jsx",
              source_files: ["footer.js"],
            },
          },
          folders: {
            common: {
              files: {
                "Button.jsx": {
                  description: "Reusable button component",
                  namespace: "components.common",
                  file_type: "jsx",
                  source_files: ["button.js"],
                },
                "Input.jsx": {
                  description: "Reusable input component",
                  namespace: "components.common",
                  file_type: "jsx",
                  source_files: ["input.js"],
                },
              },
            },
          },
        },
        pages: {
          files: {
            "Home.jsx": {
              description: "Home page component",
              namespace: "pages",
              file_type: "jsx",
              source_files: ["home.js"],
            },
            "About.jsx": {
              description: "About page component",
              namespace: "pages",
              file_type: "jsx",
              source_files: ["about.js"],
            },
          },
        },
        hooks: {
          files: {
            "useAuth.js": {
              description: "Authentication hook",
              namespace: "hooks",
              file_type: "javascript",
              source_files: ["auth.js"],
            },
            "useApi.js": {
              description: "API integration hook",
              namespace: "hooks",
              file_type: "javascript",
              source_files: ["api.js"],
            },
          },
        },
        utils: {
          files: {
            "helpers.js": {
              description: "Utility functions",
              namespace: "utils",
              file_type: "javascript",
              source_files: ["helpers.js"],
            },
            "constants.js": {
              description: "Application constants",
              namespace: "utils",
              file_type: "javascript",
              source_files: ["constants.js"],
            },
          },
        },
        styles: {
          files: {
            "main.css": {
              description: "Main stylesheet",
              namespace: "styles",
              file_type: "css",
              source_files: ["styles.css"],
            },
            "variables.css": {
              description: "CSS variables",
              namespace: "styles",
              file_type: "css",
              source_files: ["variables.css"],
            },
          },
        },
      },
    },
    public: {
      files: {
        "index.html": {
          description: "Main HTML file",
          namespace: "public",
          file_type: "html",
          source_files: ["index.html"],
        },
        "favicon.ico": {
          description: "Browser favicon",
          namespace: "public",
          file_type: "image",
          source_files: ["favicon.ico"],
        },
      },
    },
  },
};
