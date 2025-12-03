import React from "react";
import { Calendar, Clock, X as XIcon } from "lucide-react";

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

export default function TechnicianWorkloadModal({ technician, onClose }) {
  if (!technician) return null;

  const workOrders = technician.openWorkOrders || [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-500 text-white";
      case "In Progress":
        return "bg-[#ffb111] text-white";
      case "Pending":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-900 text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              Open Work Orders – {technician.name}
            </h2>
            <p className="text-xs text-gray-500">
              Currently assigned work orders ({workOrders.length})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-3 text-sm">
          {workOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No open work orders.
            </div>
          ) : (
            workOrders.map((wo) => (
              <div
                key={wo.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#c20001]">{wo.id}</p>
                    {wo.customerName && (
                      <p className="text-xs text-gray-600">
                        {wo.customerName}
                      </p>
                    )}
                    {wo.category && (
                      <p className="text-[11px] text-gray-500">
                        {wo.category}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusBadgeClass(wo.status)}>
                    {wo.status}
                  </Badge>
                </div>
                {(wo.scheduledDate || wo.scheduledTime) && (
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    {wo.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {wo.scheduledDate}
                      </span>
                    )}
                    {wo.scheduledTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {wo.scheduledTime}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-6 py-3 border-t">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
