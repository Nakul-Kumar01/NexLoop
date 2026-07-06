import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../utils/axiosClient";

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(
          `/problem/problemSubmissions/${problemId}`
        );
        console.log("here",response.data);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch submission history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "badge-success";
      case "wrong":
        return "badge-error";
      case "error":
        return "badge-warning";
      case "pending":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-ring loading-lg text-yellow-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="alert alert-error shadow-lg my-6"
      >
        <span>{error}</span>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent tracking-wide"
      >
        Submission History
      </motion.h2>

      {submissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="alert alert-info shadow-lg"
        >
          <span>No submissions found for this problem</span>
        </motion.div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-gradient-to-br from-[#061021] via-[#071428] to-[#08122a] border border-[#0a1a3a]">
            <table className="table table-zebra w-full text-gray-200">
              <thead className="bg-[#0a1a3a] text-yellow-500">
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody layout>
                {submissions.map((sub, index) => (
                  <motion.tr
                    key={sub._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255, 255, 0, 0.05)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="hover:cursor-pointer"
                  >
                    <td>{index + 1}</td>
                    <td className="font-mono">{sub.language}</td>
                    <td>
                      <span
                        className={`badge ${getStatusColor(
                          sub?.status
                        )} `}
                      >
                        {console.log("++",sub)}
                        {console.log("--",sub.status)}
                        {sub.status?.description?.charAt(0).toUpperCase() +
                          sub.status?.description?.slice(1)}
                      </span>
                    </td>
                    <td className="font-mono">{sub.runtime} sec</td>
                    <td className="font-mono">{formatMemory(sub.memory)}</td>
                    <td className="font-mono">
                      {sub.testCasesPassed}/{sub.testCasesTotal}
                    </td>
                    <td>{formatDate(sub.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-outline border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-[#061021] transition-all duration-300"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        View Code
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Showing {submissions.length} submissions
          </p>
        </>
      )}

      {/* Code View Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-box w-11/12 max-w-5xl bg-gradient-to-br from-[#061021] via-[#071428] to-[#08122a] text-gray-200 rounded-2xl shadow-2xl border border-yellow-500"
            >
              <h3 className="font-bold text-xl mb-4 text-yellow-500">
                {selectedSubmission.language} Submission
              </h3>

              <div className="mb-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`badge ${getStatusColor(
                      selectedSubmission.status
                    )}`}
                  >
                    {selectedSubmission.status}
                  </span>
                  <span className="badge badge-outline">
                    Runtime: {selectedSubmission.runtime}s
                  </span>
                  <span className="badge badge-outline">
                    Memory: {formatMemory(selectedSubmission.memory)}
                  </span>
                  <span className="badge badge-outline">
                    Passed: {selectedSubmission.testCasesPassed}/
                    {selectedSubmission.testCasesTotal}
                  </span>
                </div>

                {selectedSubmission.errorMessage && (
                  <div className="alert alert-error mt-2">
                    <span>{selectedSubmission.errorMessage}</span>
                  </div>
                )}
              </div>

              <pre className="p-4 bg-[#0a1a3a] text-yellow-100 rounded-xl overflow-x-auto border border-yellow-500/30 shadow-inner">
                <code>{selectedSubmission.code}</code>
              </pre>

              <div className="modal-action">
                <button
                  className="btn bg-yellow-500 text-[#061021] hover:bg-yellow-400 transition-all"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmissionHistory;
