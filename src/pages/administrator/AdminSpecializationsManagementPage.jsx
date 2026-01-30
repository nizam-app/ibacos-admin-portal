// src/pages/administrator/AdminSpecializationsManagementPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import SpecializationsAPI from "../../api/specializationsApi";

// ---------------------------------------------------------
// UI Components
// ---------------------------------------------------------
const Card = ({ className = "", children }) => (
  <div
    className={
      "bg-white rounded-xl border border-gray-200 shadow-sm " + className
    }
  >
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={"px-6 pt-5 pb-3 border-b border-gray-100 " + className}>
    {children}
  </div>
);

const CardContent = ({ className = "", children }) => (
  <div className={"px-6 pb-6 pt-4 " + className}>{children}</div>
);

const Button = ({
  children,
  variant = "solid",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    solid: "bg-[#c20001] text-white hover:bg-[#a00001]",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/40 outline-none " +
      className
    }
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/40 outline-none resize-none " +
      className
    }
    {...props}
  />
);

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const Badge = ({ className = "", children }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
      className
    }
  >
    {children}
  </span>
);

const Modal = ({ open, title, description, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-4 max-h-[65vh] overflow-y-auto space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------
const AdminSpecializationsManagementPage = () => {
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Load specializations
  const loadSpecializations = async () => {
    try {
      setIsLoading(true);
      const res = await SpecializationsAPI.getAll();
      const data = res.data?.data || res.data || [];
      setSpecializations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load specializations", error);
      await Swal.fire({
        icon: "error",
        title: "Failed to load specializations",
        text: error.response?.data?.message || "Please try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpecializations();
  }, []);

  // Handle add new
  const handleAddNew = () => {
    setEditingSpecialization(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (spec) => {
    setEditingSpecialization(spec);
    setFormData({
      name: spec.name,
      description: spec.description || "",
      isActive: spec.isActive !== undefined ? spec.isActive : true,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (spec) => {
    const result = await Swal.fire({
      title: "Delete Specialization?",
      text: `Are you sure you want to delete "${spec.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await SpecializationsAPI.delete(spec.id);
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Specialization deleted successfully.",
        confirmButtonColor: "#c20001",
        timer: 1500,
        showConfirmButton: false,
      });
      loadSpecializations();
    } catch (error) {
      console.error("Delete failed", error);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.response?.data?.message || "Failed to delete specialization.",
        confirmButtonColor: "#c20001",
      });
    }
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Name is required.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    try {
      setIsSaving(true);
      if (editingSpecialization) {
        // Update
        await SpecializationsAPI.update(editingSpecialization.id, {
          description: formData.description,
          isActive: formData.isActive,
        });
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Specialization updated successfully.",
          confirmButtonColor: "#c20001",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Create
        await SpecializationsAPI.create({
          name: formData.name,
          description: formData.description,
        });
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: "Specialization created successfully.",
          confirmButtonColor: "#c20001",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      loadSpecializations();
    } catch (error) {
      console.error("Save failed", error);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: error.response?.data?.message || "Failed to save specialization.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Specializations Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, update, and manage technician specializations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSpecializations}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Specialization
          </Button>
        </div>
      </div>

      {/* Specializations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Specializations
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {specializations.length} specialization(s) found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 mx-auto text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
          ) : specializations.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm text-gray-500 mt-3">No specializations found</p>
              <Button
                size="sm"
                className="mt-4"
                onClick={handleAddNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Specialization
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {specializations.map((spec) => (
                <div
                  key={spec.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#c20001]/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {spec.name}
                        </h3>
                        {spec.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {spec.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {spec.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {spec.createdBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Created by: {spec.createdBy.name}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(spec)}
                      className="flex-1 border border-gray-300 hover:border-gray-400"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(spec)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-gray-300 hover:border-gray-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        title={editingSpecialization ? "Edit Specialization" : "Add New Specialization"}
        description={
          editingSpecialization
            ? "Update specialization details"
            : "Create a new specialization for technicians"
        }
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Electrical, Plumbing, HVAC"
              disabled={!!editingSpecialization}
              required
            />
            {editingSpecialization && (
              <p className="text-xs text-gray-500 mt-1">
                Name cannot be changed after creation
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this specialization covers..."
            />
          </div>

          {editingSpecialization && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isActive">Status</Label>
                <p className="text-xs text-gray-500">
                  Toggle specialization active/inactive status
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? "bg-[#c20001]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingSpecialization
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSpecializationsManagementPage;
