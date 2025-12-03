import React, { useEffect, useState } from "react";
import { UserCheck, UserX, AlertTriangle, X as XIcon } from "lucide-react";

function Badge({ className = "", children }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
        className
      }
    >
      {children}
    </span>
  );
}

export default function BlockTechnicianModal({
  technician,
  mode = "block", // "block" | "unblock"
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [technician, mode]);

  if (!technician) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "block" && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {mode === "block" ? "Block Technician" : "Unblock Technician"}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === "block"
                ? "Prevent this technician from receiving NEW work orders."
                : "Make this technician available again for work orders."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Technician Name</p>
              <p className="font-medium text-gray-900">{technician.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Technician ID</p>
              <p className="font-medium text-gray-900">{technician.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Specialty</p>
              <p className="font-medium text-gray-900">
                {technician.specialty}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Active Work Orders</p>
              <p className="font-medium text-[#c20001]">
                {technician.activeWorkOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-sm">
          {mode === "block" ? (
            <>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Important</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Technician will not be assigned to new work orders.</li>
                    <li>
                      Current active work orders ({technician.activeWorkOrders})
                      stay unchanged.
                    </li>
                    <li>Reason will be stored in audit log.</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Reason for blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. repeated no-shows, unacceptable behaviour..."
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This note can be seen by other admins later.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex gap-3">
                <UserCheck className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Unblock confirmation</p>
                  <p>
                    Technician will be available for new assignments again.
                    Previous block reason remains in the history.
                  </p>
                </div>
              </div>

              {technician.blockedReason && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs text-gray-700">
                  <p className="font-semibold mb-1">Previous block reason</p>
                  <p className="text-[11px] text-gray-500 mb-1">
                    Blocked on: {technician.blockedDate || "-"}
                  </p>
                  <p>{technician.blockedReason}</p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 ${
                mode === "block"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {mode === "block" ? (
                <>
                  <UserX className="w-4 h-4" />
                  Confirm Block
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
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
