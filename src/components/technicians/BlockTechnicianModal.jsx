// src/components/technicians/BlockTechnicianModal.jsx
import React, { useState } from "react";

// --- Icon components (pure SVG + Tailwind) ---
const X = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const AlertTriangle = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const UserX = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 8l-4 4m0-4l4 4"
    />
  </svg>
);

const UserCheck = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 11l2 2 4-4"
    />
  </svg>
);

// props: { technician, action, onClose, onConfirm }
function BlockTechnicianModal({ technician, action, onClose, onConfirm }) {
  const [blockReason, setBlockReason] = useState("");

  if (!technician || !action) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === "block") {
      onConfirm(technician.id, blockReason);
    } else {
      onConfirm(technician.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {action === "block" ? "Block Technician" : "Unblock Technician"}
            </h2>
            <p className="text-sm text-gray-600">
              {action === "block"
                ? "Prevent this technician from receiving new work orders."
                : "Restore technician availability for work orders."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Technician Info */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Technician Name</p>
              <p className="font-medium text-[#c20001]">{technician.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Technician ID</p>
              <p className="font-medium text-gray-800">{technician.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Specialty</p>
              <p className="font-medium text-gray-800">{technician.specialty}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Work Orders</p>
              <p className="font-semibold text-[#c20001]">
                {technician.activeWorkOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5 text-sm">
          {action === "block" ? (
            <>
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    Important Notice
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Blocking this technician will:
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                    <li>Prevent them from being assigned to new work orders</li>
                    <li>
                      Not affect their current active work orders (
                      {technician.activeWorkOrders})
                    </li>
                    <li>Notify the technician about their blocked status</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="blockReason"
                  className="text-sm font-medium text-gray-700"
                >
                  Reason for Blocking *
                </label>
                <textarea
                  id="blockReason"
                  className="h-32 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none ring-0 transition focus:border-[#c20001] focus:ring-1 focus:ring-[#c20001]"
                  placeholder="Please provide a detailed reason for blocking this technician (e.g., performance issues, availability concerns, disciplinary action)..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  This reason will be recorded in the system and can be viewed
                  by administrators.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <UserCheck className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Unblock Confirmation
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    Unblocking this technician will make them available for new
                    work order assignments.
                  </p>
                </div>
              </div>

              {technician.blockedReason && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Previous Block Reason
                  </p>
                  <div className="rounded-md border border-gray-200 bg-gray-100 p-3 text-sm">
                    <p className="text-xs text-gray-600">
                      Blocked on: {technician.blockedDate}
                    </p>
                    <p className="mt-2 text-gray-800">
                      {technician.blockedReason}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={action === "block" && !blockReason}
              className={`flex-1 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition ${
                action === "block"
                  ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                  : "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
              }`}
            >
              {action === "block" ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Confirm Block
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Confirm Unblock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlockTechnicianModal;
export { BlockTechnicianModal };
