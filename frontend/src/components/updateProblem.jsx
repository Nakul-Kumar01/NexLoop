import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";

export default function UpdateProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const themeBg = "bg-[#061021]"; // main bg
  const themeCard = "bg-[#08122a]"; // card bg

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${id}`);
        // ensure nested arrays exist so form doesn't break
        const data = response.data || {};
        data.constraints = data.constraints || [];
        data.startCode = data.startCode || [];
        data.tags = data.tags || [];
        data.companies = data.companies || [];
        data.hint = data.hint || [];
        data.visibleTestCases = data.visibleTestCases || [];
        data.referenceSolution = data.referenceSolution || [];
        data.similarProblem = data.similarProblem || [];
        setProblem(data);
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleChange = (field, value) => {
    setProblem((p) => ({ ...p, [field]: value }));
  };

  /* Arrays helpers */
  const updateArrayAt = (arrayKey, index, newVal) => {
    setProblem((p) => {
      const arr = [...(p[arrayKey] || [])];
      arr[index] = newVal;
      return { ...p, [arrayKey]: arr };
    });
  };
  const pushToArray = (arrayKey, defaultVal) => {
    setProblem((p) => ({ ...p, [arrayKey]: [...(p[arrayKey] || []), defaultVal] }));
  };
  const removeFromArray = (arrayKey, index) => {
    setProblem((p) => {
      const arr = [...(p[arrayKey] || [])];
      arr.splice(index, 1);
      return { ...p, [arrayKey]: arr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem) return;
    setSaving(true);
    try {
        // console.log("updating problem:", problem);
      await axiosClient.patch(`/problem/update/${id}`, problem);
    //   console.log("Updated");
      alert("Problem updated successfully");
      // optionally navigate back to list or problem view
      // navigate(`/problems/${id}`);
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Error updating problem. Check console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${themeBg} text-yellow-500 p-6`}>
        <div className={`p-6 rounded-2xl ${themeCard} shadow-lg`}>Loading problem...</div>
      </div>
    );

  return (
    <div className={`${themeBg} min-h-screen text-yellow-500 p-6`}> 
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Update Problem</h1>
        <form onSubmit={handleSubmit} className={`p-6 ${themeCard} rounded-2xl shadow-xl space-y-6`}>
          {/* Basic fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428] placeholder-yellow-300"
                value={problem.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Difficulty</label>
              <select
                className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
                value={problem.difficulty || "easy"}
                onChange={(e) => handleChange("difficulty", e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
              value={problem.discription || problem.description || ""}
              onChange={(e) => handleChange("discription", e.target.value)}
            />
          </div>

          {/* Tags and companies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {(problem.tags || []).map((t, i) => (
                  <div key={i} className="flex items-center bg-[#061221] px-2 py-1 rounded-md">
                    <input
                      value={t}
                      onChange={(e) => updateArrayAt("tags", i, e.target.value)}
                      className="bg-transparent outline-none text-sm"
                    />
                    <button type="button" onClick={() => removeFromArray("tags", i)} className="ml-2 text-sm">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => pushToArray("tags", "")} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add Tag</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Companies</label>
              <div className="flex flex-wrap gap-2">
                {(problem.companies || []).map((c, i) => (
                  <div key={i} className="flex items-center bg-[#061221] px-2 py-1 rounded-md">
                    <input
                      value={c}
                      onChange={(e) => updateArrayAt("companies", i, e.target.value)}
                      className="bg-transparent outline-none text-sm"
                    />
                    <button type="button" onClick={() => removeFromArray("companies", i)} className="ml-2 text-sm">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => pushToArray("companies", "")} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add Company</button>
              </div>
            </div>
          </div>

          {/* Bookmark toggle and constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Bookmarked</label>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(problem.bookMark)}
                    onChange={(e) => handleChange("bookMark", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Visible on bookmarks</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Constraints (one per line)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
                value={(problem.constraints || []).join("\n")}
                onChange={(e) => handleChange("constraints", e.target.value.split(/\n/).filter(Boolean))}
              />
            </div>
          </div>

          {/* Start Code editor list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Start Code (languages)</h2>
              <button type="button" onClick={() => pushToArray("startCode", { language: "", HeaderCode: "", UserCode: "", FooterCode: "" })} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add</button>
            </div>

            {(problem.startCode || []).map((sc, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#061b2a]">
                <div className="flex items-center justify-between mb-2">
                  <input
                    className="p-2 rounded-md bg-[#071428]"
                    placeholder="Language (eg. C++)"
                    value={sc.language || ""}
                    onChange={(e) => updateArrayAt("startCode", idx, { ...sc, language: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => removeFromArray("startCode", idx)} className="px-2 py-1 rounded-md bg-red-600 text-sm">Remove</button>
                  </div>
                </div>
                <label className="text-sm">HeaderCode</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
                  value={sc.HeaderCode || ""}
                  onChange={(e) => updateArrayAt("startCode", idx, { ...sc, HeaderCode: e.target.value })}
                />
                <label className="text-sm mt-2">UserCode</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
                  value={sc.UserCode || ""}
                  onChange={(e) => updateArrayAt("startCode", idx, { ...sc, UserCode: e.target.value })}
                />
                <label className="text-sm mt-2">FooterCode</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-0 p-3 bg-[#071428]"
                  value={sc.FooterCode || ""}
                  onChange={(e) => updateArrayAt("startCode", idx, { ...sc, FooterCode: e.target.value })}
                />
              </div>
            ))}
          </div>

          {/* Hints */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Hints</h2>
              <button type="button" onClick={() => pushToArray("hint", "")} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add Hint</button>
            </div>
            <div className="mt-2 space-y-2">
              {(problem.hint || []).map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 p-2 rounded-md bg-[#071428]" value={h} onChange={(e) => updateArrayAt("hint", i, e.target.value)} />
                  <button type="button" onClick={() => removeFromArray("hint", i)} className="px-2 py-1 rounded-md bg-red-600">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Visible test cases */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Visible Test Cases</h2>
              <button type="button" onClick={() => pushToArray("visibleTestCases", { input: "", output: "", explanation: "" })} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Test</button>
            </div>
            <div className="mt-2 space-y-3">
              {(problem.visibleTestCases || []).map((tc, i) => (
                <div key={i} className="p-3 rounded-md bg-[#061b2a]">
                  <div className="flex justify-between items-start">
                    <strong>Testcase {i + 1}</strong>
                    <button type="button" onClick={() => removeFromArray("visibleTestCases", i)} className="px-2 py-1 rounded-md bg-red-600">Remove</button>
                  </div>
                  <label className="text-sm mt-1">Input</label>
                  <textarea rows={2} className="w-full mt-1 rounded-md p-2 bg-[#071428]" value={tc.input} onChange={(e) => updateArrayAt("visibleTestCases", i, { ...tc, input: e.target.value })} />
                  <label className="text-sm mt-1">Output</label>
                  <input className="w-full mt-1 rounded-md p-2 bg-[#071428]" value={tc.output} onChange={(e) => updateArrayAt("visibleTestCases", i, { ...tc, output: e.target.value })} />
                  <label className="text-sm mt-1">Explanation</label>
                  <input className="w-full mt-1 rounded-md p-2 bg-[#071428]" value={tc.explanation} onChange={(e) => updateArrayAt("visibleTestCases", i, { ...tc, explanation: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Reference solutions */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Reference Solutions</h2>
              <button type="button" onClick={() => pushToArray("referenceSolution", { language: "", SolutionClass: "" })} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add</button>
            </div>
            <div className="mt-2 space-y-3">
              {(problem.referenceSolution || []).map((rs, i) => (
                <div key={i} className="p-3 rounded-md bg-[#061b2a]">
                  <div className="flex justify-between">
                    <input value={rs.language} onChange={(e) => updateArrayAt("referenceSolution", i, { ...rs, language: e.target.value })} className="p-2 rounded-md bg-[#071428]" />
                    <button type="button" onClick={() => removeFromArray("referenceSolution", i)} className="px-2 py-1 rounded-md bg-red-600">Remove</button>
                  </div>
                  <label className="text-sm mt-2">Solution Class / Code</label>
                  <textarea rows={6} className="w-full mt-1 rounded-md p-2 bg-[#071428]" value={rs.SolutionClass} onChange={(e) => updateArrayAt("referenceSolution", i, { ...rs, SolutionClass: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Similar problems (simple list) */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Similar Problems</h2>
              <button type="button" onClick={() => pushToArray("similarProblem", "")} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">+ Add</button>
            </div>
            <div className="mt-2 space-y-2">
              {(problem.similarProblem || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s} onChange={(e) => updateArrayAt("similarProblem", i, e.target.value)} className="flex-1 p-2 rounded-md bg-[#071428]" />
                  <button type="button" onClick={() => removeFromArray("similarProblem", i)} className="px-2 py-1 rounded-md bg-red-600">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-transparent border border-yellow-500">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-md bg-yellow-500 text-black font-medium">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
