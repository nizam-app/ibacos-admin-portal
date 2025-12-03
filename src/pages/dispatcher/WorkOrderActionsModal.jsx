import React, { useState } from "react";
import { Calendar, Clock, User, XCircle, MapPin, AlertCircle } from "lucide-react";

/* Small helper */
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

function WorkOrderActionsModal({
  workOrder,
  action,
  technicians,
  blockedTechnicians,
  onClose,
  onConfirm,
}) {
  const [selectedTechnician, setSelectedTechnician] = useState(
    workOrder.assignedTechnician || ""
  );
  const [scheduledDate, setScheduledDate] = useState(workOrder.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(workOrder.scheduledTime);
  const [estimatedDuration, setEstimatedDuration] = useState(
    workOrder.estimatedDuration || "2"
  );
  const [notes, setNotes] = useState(workOrder.notes || "");
  const [cancellationReason, setCancellationReason] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredTechs = technicians
    .filter((t) => !blockedTechnicians.includes(t.id))
    .sort((a, b) => a.distance - b.distance);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === "cancel") {
      onConfirm(workOrder.id, action, { reason: cancellationReason });
      return;
    }

    onConfirm(workOrder.id, action, {
      assignedTechnician: selectedTechnician,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      notes,
    });
  };

  const titleMap = {
    assign: "Assign Work Order",
    reassign: "Reassign Work Order",
    reschedule: "Reschedule Work Order",
    cancel: "Cancel Work Order",
  };

  const descriptionMap = {
    assign: "Assign a technician to this work order.",
    reassign: "Change the assigned technician or schedule.",
    reschedule: "Change the scheduled date and time.",
    cancel:
      "Cancel this work order. The customer and technician will be notified.",
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={stop}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {titleMap[action]}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {descriptionMap[action]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Work order summary */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Work Order ID</p>
              <p className="font-medium text-[#c20001]">{workOrder.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Service Request</p>
              <p>{workOrder.srId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p>{workOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p>{workOrder.category}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          {action === "cancel" ? (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Warning: This action cannot be undone
                  </p>
                  <p className="mt-1 text-red-700">
                    Cancelling this work order will notify the assigned
                    technician and the customer.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cancel-reason"
                  className="text-sm font-medium text-gray-700"
                >
                  Cancellation Reason *
                </label>
                <textarea
                  id="cancel-reason"
                  required
                  rows={4}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  placeholder="Explain why this work order is being cancelled..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Technician list (assign / reassign) */}
              {action !== "reschedule" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {action === "reassign"
                        ? "Reassign to Technician *"
                        : "Assign Technician *"}
                    </label>
                    <p className="text-xs text-gray-500">
                      Sorted by distance (nearest first)
                    </p>
                  </div>

                  {filteredTechs.length === 0 ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      No technicians available. All are blocked.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto rounded-lg border">
                      {filteredTechs.map((tech) => (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => setSelectedTechnician(tech.id)}
                          className={`flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                            selectedTechnician === tech.id
                              ? "bg-blue-50 border-l-4 border-l-[#c20001]"
                              : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900">
                              {tech.name} – {tech.specialty}
                            </p>
                            <p className="text-xs text-gray-500">
                              <MapPin className="mr-1 inline-block h-3 w-3" />
                              {tech.distance} km • {tech.type}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              tech.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {tech.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date / time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Scheduled Date *
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    min={today}
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledTime"
                    className="text-sm font-medium text-gray-700"
                  >
                    Scheduled Time *
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label
                  htmlFor="duration"
                  className="text-sm font-medium text-gray-700"
                >
                  Estimated Duration (hours) *
                </label>
                <select
                  id="duration"
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                >
                  {["1", "2", "3", "4", "6", "8"].map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h !== "1" ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or special instructions for the technician..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
              action === "cancel"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#c20001] hover:bg-[#a00001]"
            }`}
          >
            {action === "cancel"
              ? "Confirm Cancellation"
              : action === "reschedule"
              ? "Save Schedule"
              : action === "reassign"
              ? "Update Work Order"
              : "Assign Work Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkOrderActionsModal;
