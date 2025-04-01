import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockAnalysisResult } from "../api/mockData";

const AnalysisResult = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading the analysis result
    setTimeout(() => {
      setResult(mockAnalysisResult);
    }, 1000);
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Migration Analysis Results
            </h1>
            <p className="text-gray-600 mt-2">
              AngularJS to React Conversion Plan
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Files</h3>
            <p className="text-2xl font-bold text-blue-600">
              {result.summary.total_files}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">
              Analyzed Files
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {result.summary.analyzed_files}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">
              Ready for React
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {result.summary.migration_ready}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">
              Needs Attention
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {result.summary.needs_attention}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Migration Recommendations
          </h2>
          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{rec.file}</h3>
                    <p className="text-sm text-gray-500 mt-1">{rec.type}</p>
                    <p className="text-gray-700 mt-2">{rec.suggestion}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : rec.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
