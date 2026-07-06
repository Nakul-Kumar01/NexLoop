import React, { useState } from "react";
import z from "zod";
import axiosClient from "../utils/axiosClient";

// Zod schema (you provided)
const contestSchema = z.object({
  name: z.string().min(3, "Contest name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  startTime: z
    .string()
    .refine((data) => !isNaN(Date.parse(data)), { message: "Invalid start time" }),
  endTime: z
    .string()
    .refine((data) => !isNaN(Date.parse(data)), { message: "Invalid end time" }),
  problems: z
    .array(z.string())
    .min(4, "At least 4 problems are required")
    .max(4, "Only 4 problems are allowed"),
});

export default function AdminContestCreate() {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Use datetime-local inputs; will convert to ISO (UTC) before submitting
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  // Problems chips
  const [problemInput, setProblemInput] = useState("");
  const [problems, setProblems] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Helpers
  const addProblem = () => {
    setServerError("");
    setSuccess("");
    const trimmed = problemInput.trim();
    if (!trimmed) {
      setErrors((e) => ({ ...e, problems: "Problem id can't be empty" }));
      return;
    }
    if (problems.length >= 4) {
      setErrors((e) => ({ ...e, problems: "Only 4 problems allowed" }));
      return;
    }
    // basic id length check (mongo-ish) — optional, remove if not desired
    if (trimmed.length < 10) {
      setErrors((e) => ({ ...e, problems: "Problem id looks too short" }));
      return;
    }
    setProblems((p) => [...p, trimmed]);
    setProblemInput("");
    setErrors((e) => ({ ...e, problems: undefined }));
  };

  const removeProblem = (idx) => {
    setProblems((p) => p.filter((_, i) => i !== idx));
  };

  // Convert local datetime-local string to ISO UTC
  const toISOStringUTC = (localDateString) => {
    if (!localDateString) return "";
    // localDateString like "2025-12-02T09:20"
    const dt = new Date(localDateString);
    return dt.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccess("");

    // Build payload with ISO strings for validation
    const payload = {
      name,
      description,
      startTime: toISOStringUTC(startLocal),
      endTime: toISOStringUTC(endLocal),
      problems,
    };

    // local zod validation
    try {
      contestSchema.parse(payload);

      // Additional logical check: end after start
      if (new Date(payload.endTime) <= new Date(payload.startTime)) {
        setErrors({ endTime: "End time must be after start time" });
        return;
      }

      setLoading(true);
      await axiosClient.post("/contest/create", payload );
      setSuccess("Contest created successfully!");
      // optionally reset form
      setName("");
      setDescription("");
      setStartLocal("");
      setEndLocal("");
      setProblems([]);
    } catch (err) {
      // zod error handling
      if (err && err.errors && Array.isArray(err.errors)) {
        const map = {};
        for (const e of err.errors) {
          // e.path may be ['problems'] or ['name'] etc.
          map[e.path?.[0] ?? "form"] = e.message;
        }
        setErrors(map);
      } else {
        // unknown/server error
        setServerError(err?.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Small formatter for preview
  const fmtPreviewTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Inline background / accent using your palette
  const bgGradient = {
    background:
      "linear-gradient(180deg, #061021 0%, #071428 50%, #08122a 100%)",
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={bgGradient}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Create Contest
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-2 max-w-2xl">
            Use this form to create a coding contest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl backdrop-blur-sm bg-white/4 border border-white/6 shadow-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text text-gray-100">Contest Name</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Weekly Challenge 7"
                  className="input input-bordered w-full bg-transparent text-white placeholder-gray-400"
                />
                {errors.name && (
                  <p className="text-red-300 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-gray-100">Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description (min 10 chars)"
                  className="textarea textarea-bordered w-full h-28 bg-transparent text-white placeholder-gray-400"
                />
                {errors.description && (
                  <p className="text-red-300 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text text-gray-100">Start Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startLocal}
                    onChange={(e) => setStartLocal(e.target.value)}
                    className="input input-bordered w-full bg-transparent text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-300 mt-1">
                    Will be converted to UTC on submit.
                  </p>
                  {errors.startTime && (
                    <p className="text-red-300 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-gray-100">End Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endLocal}
                    onChange={(e) => setEndLocal(e.target.value)}
                    className="input input-bordered w-full bg-transparent text-white placeholder-gray-400"
                  />
                  {errors.endTime && (
                    <p className="text-red-300 text-sm mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Problems input */}
              <div>
                <label className="label">
                  <span className="label-text text-gray-100">Problems (exactly 4)</span>
                </label>

                <div className="flex gap-2">
                  <input
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    placeholder="Paste problem id and press Add"
                    className="input input-bordered flex-1 bg-transparent text-white placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addProblem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addProblem}
                    className="btn px-4 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-transform transform active:scale-95"
                  >
                    Add
                  </button>
                </div>

                {/* Chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {problems.map((p, idx) => (
                    <div
                      key={idx}
                      className="badge badge-outline flex items-center gap-2 border-yellow-500 text-yellow-200"
                    >
                      <span className="text-xs md:text-sm">{p}</span>
                      <button
                        type="button"
                        onClick={() => removeProblem(idx)}
                        className="ml-2 btn btn-ghost btn-sm text-yellow-300"
                        aria-label={`Remove ${p}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {errors.problems && (
                  <p className="text-red-300 text-sm mt-1">{errors.problems}</p>
                )}
              </div>

              {/* Server error / success */}
              {serverError && (
                <div className="p-3 rounded-md bg-red-900/40 text-red-200">
                  {serverError}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-md bg-green-900/40 text-emerald-200">
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex-1 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition"
                >
                  {loading ? "Creating..." : "Create Contest"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // quick reset
                    setName("");
                    setDescription("");
                    setStartLocal("");
                    setEndLocal("");
                    setProblems([]);
                    setProblemInput("");
                    setErrors({});
                    setServerError("");
                    setSuccess("");
                  }}
                  className="btn btn-outline text-white"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* PREVIEW */}
          <div className="p-6 rounded-2xl shadow-xl border border-white/6 relative overflow-hidden">
            {/* Accent vertical bar */}
            <div
              className="absolute left-0 top-0 h-full w-2"
              style={{ background: "linear-gradient(180deg,#FFD54F,#F59E0B)" }}
            />
            <div className="ml-4">
              <div
                className="rounded-xl p-6"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {name || "Contest Title"}
                </h2>
                <p className="mt-2 text-gray-300 min-h-[56px]">
                  {description || "Short contest description will appear here."}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Starts</span>
                    <span className="font-medium">
                      {fmtPreviewTime(toISOStringUTC(startLocal))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Ends</span>
                    <span className="font-medium">
                      {fmtPreviewTime(toISOStringUTC(endLocal))}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-sm text-gray-200 mb-2">Problems</h3>
                  <div className="flex flex-wrap gap-3">
                    {problems.length ? (
                      problems.map((p, i) => (
                        <div
                          key={p}
                          className="px-3 py-2 rounded-lg bg-white/6 text-yellow-50 text-xs font-medium"
                        >
                          {i + 1}. {p}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No problems added yet.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Preview — looks similar to the contest card users will see.
                  </div>
                  <div className="text-sm text-yellow-400 font-semibold">
                    {problems.length === 4 ? "Ready" : "Add 4 problems"}
                  </div>
                </div>
              </div>

              {/* small helper */}
              <div className="mt-6 text-xs text-gray-400">
                Tip: Times entered are from your local timezone and will be stored as
                UTC ISO strings. Make sure end &gt; start.
              </div>
            </div>
          </div>
        </div>

        {/* subtle footer */}
        <div className="mt-10 text-xs text-gray-500">
          Designed with ❤️ using your palette: <code>#061021</code>,{" "}
          <code>#071428</code>, <code>#08122a</code> + <span className="text-yellow-400">yellow-500</span>.
        </div>
      </div>
    </div>
  );
}
