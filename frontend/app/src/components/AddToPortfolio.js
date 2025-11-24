import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import BASE_URL from "../config";

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function AddToPortfolio({ schemeCode, schemeName, onClose }) {
  const { user } = useAuth();
  const [investmentDate, setInvestmentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [unitsHeld, setUnitsHeld] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!investmentDate || !unitsHeld) {
      setError(
        "Please fill in the required fields: Investment Date and Units Held.",
      );
      return;
    }
    if (!user) {
      setError("You must be logged in to perform this action.");
      return;
    }

    setLoading(true);

    try {
      const token = await user.getIdToken();
      const payload = {
        schemeCode: schemeCode,
        date: investmentDate,
        units: parseFloat(unitsHeld),
      };

      await axios.post(`${BASE_URL}/user/portfolio/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Failed to add to portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative transform transition-all animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Add to Your Portfolio
        </h2>
        <p
          className="text-sm text-gray-500 mb-6 font-medium truncate"
          title={schemeName}
        >
          {schemeName}
        </p>

        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold text-green-700">
              Fund Added Successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="investment-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Investment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="investment-date"
                  value={investmentDate}
                  onChange={(e) => setInvestmentDate(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="units-held"
                  className="block text-sm font-medium text-gray-700"
                >
                  Units Held <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="units-held"
                  value={unitsHeld}
                  onChange={(e) => setUnitsHeld(e.target.value)}
                  placeholder="e.g., 125.5"
                  step="any"
                  min="0"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Confirm and Add"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
