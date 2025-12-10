// src/pages/administrator/AdminCategoriesManagementPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  FolderKanban,
  Plus,
  Pencil,
  ChevronDown,
  ChevronRight,
  Trash2,
  RefreshCw,
} from "lucide-react";

import CategoriesAPI from "../../api/categoriesApi";

// ---------------------------------------------------------
// Small Tailwind UI helpers
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

const CardTitle = ({ className = "", children }) => (
  <h2 className={"text-base font-semibold text-gray-900 " + className}>
    {children}
  </h2>
);

const CardDescription = ({ className = "", children }) => (
  <p className={"text-xs text-gray-500 " + className}>{children}</p>
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

// Simple modal component (shared)
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
// Utility: map API -> UI model (NEW API SHAPE)
// ---------------------------------------------------------
//
// API response (GET /categories):
// [
//   {
//     id, name, description, image, isActive, services: [
//       {
//         id, categoryId, name, description, subservices: [
//           { id, serviceId, name, description, baseRate }
//         ]
//       }
//     ]
//   }
// ]
//
const mapApiCategory = (cat) => ({
  id: String(cat.id),
  name: cat.name,
  description: cat.description,
  isActive: !!cat.isActive,
  image: cat.image || null,
  services: (cat.services || []).map((srv) => ({
    id: String(srv.id),
    categoryId: srv.categoryId,
    name: srv.name,
    description: srv.description,
    subServices: (srv.subservices || []).map((sub) => ({
      id: String(sub.id),
      serviceId: sub.serviceId,
      name: sub.name,
      description: sub.description,
      baseRate: sub.baseRate,
    })),
  })),
});

// ---------------------------------------------------------
// Page Component
// ---------------------------------------------------------

const PAGE_SIZE = 6;

const AdminCategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);

  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedServices, setExpandedServices] = useState([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubServiceModalOpen, setIsSubServiceModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingService, setEditingService] = useState({
    categoryId: "",
    service: null,
  });
  const [editingSubService, setEditingSubService] = useState({
    categoryId: "",
    serviceId: "",
    subService: null,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  // service এ এখন শুধু name + description
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
  });

  // sub-service এ baseRate backend এ যায়
  const [subServiceForm, setSubServiceForm] = useState({
    name: "",
    description: "",
    baseRate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingSubService, setIsSavingSubService] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // -----------------------------------------------------
  // Load categories from API
  // -----------------------------------------------------
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await CategoriesAPI.getCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data.map(mapApiCategory));
    } catch (error) {
      console.error("Failed to load categories", error);
      await Swal.fire({
        icon: "error",
        title: "Failed to load categories",
        text: "Please check your API and try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // pagination guard: category কমে গেলে page adjust করো
  useEffect(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.max(
        1,
        Math.ceil(categories.length / PAGE_SIZE) || 1
      );
      return Math.min(prev, totalPages);
    });
  }, [categories]);

  // -----------------------------------------------------
  // Expand/collapse handlers
  // -----------------------------------------------------
  const toggleCategoryExpand = (id) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleServiceExpand = (id) => {
    setExpandedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // -----------------------------------------------------
  // Category management
  // -----------------------------------------------------
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", image: "" });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      image: category.image || "",
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.description) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in category name and description.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    try {
      setIsSavingCategory(true);

      if (editingCategory) {
        const res = await CategoriesAPI.updateCategory(editingCategory.id, {
          name: categoryForm.name,
          description: categoryForm.description,
          image: categoryForm.image || null,
        });

        const apiCat = res.data?.category || res.data;

        setCategories((prev) =>
          prev.map((c) =>
            c.id === String(editingCategory.id)
              ? {
                ...c,
                name: apiCat?.name ?? categoryForm.name,
                description: apiCat?.description ?? categoryForm.description,
                isActive:
                  typeof apiCat?.isActive === "boolean"
                    ? apiCat.isActive
                    : c.isActive,
                image:
                  apiCat && apiCat.image != null
                    ? apiCat.image
                    : (categoryForm.image || null),

              }
              : c
          )
        );

        await Swal.fire({
          icon: "success",
          title: "Category updated",
          confirmButtonColor: "#c20001",
        });
      } else {
        const res = await CategoriesAPI.createCategory({
          name: categoryForm.name,
          description: categoryForm.description,
          image: categoryForm.image || null,
        });

        const apiCat = res.data?.category || res.data;

        const newCategory = {
          id: String(apiCat.id),
          name: apiCat.name,
          description: apiCat.description,
          isActive: !!apiCat.isActive,
          image: apiCat.image || null,
          services: [],
        };

        setCategories((prev) => [...prev, newCategory]);

        await Swal.fire({
          icon: "success",
          title: "Category created",
          confirmButtonColor: "#c20001",
        });
      }

      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Save category failed", error);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Could not save category. Please try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleToggleCategory = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const willDeactivate = category.isActive;

    const result = await Swal.fire({
      icon: willDeactivate ? "warning" : "question",
      title: willDeactivate ? "Deactivate category?" : "Activate category?",
      text: willDeactivate
        ? "Existing Work Orders will still be visible, but new bookings under this category should be disabled in your front-end."
        : "Category will be available again for new bookings.",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: willDeactivate ? "Yes, deactivate" : "Yes, activate",
    });

    if (!result.isConfirmed) return;

    try {
      const res = willDeactivate
        ? await CategoriesAPI.deactivateCategory(id)
        : await CategoriesAPI.activateCategory(id);

      const apiCat = res.data?.category;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
              ...c,
              isActive:
                typeof apiCat?.isActive === "boolean"
                  ? apiCat.isActive
                  : !c.isActive,
            }
            : c
        )
      );

      await Swal.fire({
        icon: "success",
        title: willDeactivate ? "Category deactivated" : "Category activated",
        confirmButtonColor: "#c20001",
      });
    } catch (error) {
      console.error("Toggle category failed", error);
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text: "Could not change category status. Please try again.",
        confirmButtonColor: "#c20001",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete category?",
      text:
        "This will remove the category" +
        (cat.services.length
          ? " and possibly its services/sub-services depending on backend rules."
          : "."),
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await CategoriesAPI.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));

      await Swal.fire({
        icon: "success",
        title: "Category deleted",
        confirmButtonColor: "#c20001",
      });
    } catch (error) {
      console.error("Delete category failed", error);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Could not delete category. Please check dependencies.",
        confirmButtonColor: "#c20001",
      });
    }
  };

  // -----------------------------------------------------
  // Service management
  // -----------------------------------------------------
  const handleAddService = (categoryId) => {
    setEditingService({ categoryId, service: null });
    setServiceForm({ name: "", description: "" });
    setIsServiceModalOpen(true);
  };

  const handleEditService = (categoryId, service) => {
    setEditingService({ categoryId, service });
    setServiceForm({
      name: service.name,
      description: service.description,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.description) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in service name and description.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    try {
      setIsSavingService(true);

      if (editingService.service) {
        // Update
        const res = await CategoriesAPI.updateService(
          editingService.service.id,
          {
            name: serviceForm.name,
            description: serviceForm.description,
          }
        );
        const updated = res.data?.service || res.data;

        setCategories((prev) =>
          prev.map((category) => {
            if (category.id !== editingService.categoryId) return category;
            return {
              ...category,
              services: category.services.map((s) =>
                s.id === editingService.service.id
                  ? {
                    ...s,
                    name: updated?.name ?? serviceForm.name,
                    description:
                      updated?.description ?? serviceForm.description,
                  }
                  : s
              ),
            };
          })
        );
      } else {
        // Create
        const res = await CategoriesAPI.createService({
          categoryId: Number(editingService.categoryId),
          name: serviceForm.name,
          description: serviceForm.description,
        });
        const created = res.data?.service || res.data;

        const newService = {
          id: String(created.id),
          categoryId: created.categoryId,
          name: created.name,
          description: created.description,
          subServices: [],
        };

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingService.categoryId
              ? {
                ...category,
                services: [...category.services, newService],
              }
              : category
          )
        );
      }

      await Swal.fire({
        icon: "success",
        title: editingService.service ? "Service updated" : "Service created",
        confirmButtonColor: "#c20001",
      });

      setIsServiceModalOpen(false);
    } catch (error) {
      console.error("Save service failed", error);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Could not save service. Please try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (categoryId, serviceId) => {
    const category = categories.find((c) => c.id === categoryId);
    const service = category?.services.find((s) => s.id === serviceId);
    if (!category || !service) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete service?",
      text:
        "This will delete the service and its sub-services (depending on backend cascade rules).",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await CategoriesAPI.deleteService(serviceId);

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
              ...cat,
              services: cat.services.filter((s) => s.id !== serviceId),
            }
            : cat
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Service deleted",
        confirmButtonColor: "#c20001",
      });
    } catch (error) {
      console.error("Delete service failed", error);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Could not delete service. Please check dependencies.",
        confirmButtonColor: "#c20001",
      });
    }
  };

  // -----------------------------------------------------
  // Sub-service management (baseRate now goes to backend)
  // -----------------------------------------------------
  const handleAddSubService = (categoryId, serviceId) => {
    setEditingSubService({ categoryId, serviceId, subService: null });
    setSubServiceForm({
      name: "",
      description: "",
      baseRate: "",
    });
    setIsSubServiceModalOpen(true);
  };

  const handleEditSubService = (categoryId, serviceId, subService) => {
    setEditingSubService({ categoryId, serviceId, subService });
    setSubServiceForm({
      name: subService.name,
      description: subService.description,
      baseRate:
        subService.baseRate !== null && subService.baseRate !== undefined
          ? String(subService.baseRate)
          : "",
    });
    setIsSubServiceModalOpen(true);
  };

  const handleSaveSubService = async () => {
    if (!subServiceForm.name || !subServiceForm.description) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in sub-service name and description.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    const baseRateValue =
      subServiceForm.baseRate !== "" ? Number(subServiceForm.baseRate) : null;
    if (
      subServiceForm.baseRate !== "" &&
      (Number.isNaN(baseRateValue) || baseRateValue < 0)
    ) {
      await Swal.fire({
        icon: "error",
        title: "Invalid price",
        text: "Base price must be a non-negative number.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    try {
      setIsSavingSubService(true);

      if (editingSubService.subService) {
        // Update
        const res = await CategoriesAPI.updateSubservice(
          editingSubService.subService.id,
          {
            name: subServiceForm.name,
            description: subServiceForm.description,
            baseRate: baseRateValue,
          }
        );
        const updated = res.data?.subservice || res.data;

        setCategories((prev) =>
          prev.map((category) => {
            if (category.id !== editingSubService.categoryId) return category;

            return {
              ...category,
              services: category.services.map((service) => {
                if (service.id !== editingSubService.serviceId) return service;
                return {
                  ...service,
                  subServices: service.subServices.map((ss) =>
                    ss.id === editingSubService.subService.id
                      ? {
                        ...ss,
                        name: updated?.name ?? subServiceForm.name,
                        description:
                          updated?.description ?? subServiceForm.description,
                        baseRate:
                          updated?.baseRate !== undefined
                            ? updated.baseRate
                            : baseRateValue,
                      }
                      : ss
                  ),
                };
              }),
            };
          })
        );
      } else {
        // Create
        const res = await CategoriesAPI.createSubservice({
          serviceId: Number(editingSubService.serviceId),
          name: subServiceForm.name,
          description: subServiceForm.description,
          baseRate: baseRateValue,
        });
        const created = res.data?.subservice || res.data;

        const newSub = {
          id: String(created.id),
          serviceId: created.serviceId,
          name: created.name,
          description: created.description,
          baseRate:
            created.baseRate !== undefined ? created.baseRate : baseRateValue,
        };

        setCategories((prev) =>
          prev.map((category) => {
            if (category.id !== editingSubService.categoryId) return category;

            return {
              ...category,
              services: category.services.map((service) =>
                service.id === editingSubService.serviceId
                  ? {
                    ...service,
                    subServices: [...service.subServices, newSub],
                  }
                  : service
              ),
            };
          })
        );
      }

      await Swal.fire({
        icon: "success",
        title: editingSubService.subService
          ? "Sub-service updated"
          : "Sub-service created",
        confirmButtonColor: "#c20001",
      });

      setIsSubServiceModalOpen(false);
    } catch (error) {
      console.error("Save sub-service failed", error);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Could not save sub-service. Please try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsSavingSubService(false);
    }
  };

  const handleDeleteSubService = async (categoryId, serviceId, subId) => {
    const category = categories.find((c) => c.id === categoryId);
    const service = category?.services.find((s) => s.id === serviceId);
    const sub = service?.subServices.find((ss) => ss.id === subId);
    if (!category || !service || !sub) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete sub-service?",
      text: "This will delete the sub-service.",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await CategoriesAPI.deleteSubservice(subId);

      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            services: cat.services.map((srv) =>
              srv.id === serviceId
                ? {
                  ...srv,
                  subServices: srv.subServices.filter(
                    (ss) => ss.id !== subId
                  ),
                }
                : srv
            ),
          };
        })
      );

      await Swal.fire({
        icon: "success",
        title: "Sub-service deleted",
        confirmButtonColor: "#c20001",
      });
    } catch (error) {
      console.error("Delete sub-service failed", error);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Could not delete sub-service. Please try again.",
        confirmButtonColor: "#c20001",
      });
    }
  };

  // -----------------------------------------------------
  // Stats
  // -----------------------------------------------------
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.isActive).length;
    const totalServices = categories.reduce(
      (sum, cat) => sum + cat.services.length,
      0
    );
    const totalSubServices = categories.reduce(
      (sum, cat) =>
        sum +
        cat.services.reduce(
          (sSum, s) => sSum + s.subServices.length,
          0
        ),
      0
    );

    return {
      totalCategories,
      activeCategories,
      totalServices,
      totalSubServices,
    };
  }, [categories]);

  // -----------------------------------------------------
  // Pagination helpers
  // -----------------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(categories.length / PAGE_SIZE) || 1
  );
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedCategories = categories.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE
  );

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderKanban className="w-6 h-6 text-[#c20001]" />
          <h1 className="text-2xl font-semibold text-gray-900">
            3-Level Service Hierarchy
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Manage{" "}
          <span className="font-semibold">
            Category → Service → Sub-Service
          </span>{" "}
          for your booking catalog. Pricing now lives on{" "}
          <span className="font-semibold">sub-services (baseRate)</span>.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 inline-flex items-center px-2 py-1 rounded-lg">
            Only <span className="mx-1 font-semibold">Administrators</span>
            should publish structural changes to production.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={loadCategories}
            disabled={isLoading}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-2xl text-[#c20001]">
              {stats.totalCategories}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Categories</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.activeCategories}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Services</CardDescription>
            <CardTitle className="text-2xl text-[#c20001]">
              {stats.totalServices}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sub-services</CardDescription>
            <CardTitle className="text-2xl text-[#c20001]">
              {stats.totalSubServices}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Hierarchy list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Service Hierarchy</CardTitle>
            <CardDescription>
              Category (with status & image) → Service → Sub-service (with base
              price). Service/sub-service status toggles can be added later when
              backend supports it.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !categories.length ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`border rounded-lg ${category.isActive
                        ? "border-gray-200 bg-white"
                        : "border-gray-200 bg-gray-50 opacity-70"
                      }`}
                  >
                    {/* Category header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <button
                              onClick={() =>
                                toggleCategoryExpand(category.id)
                              }
                              className="hover:bg-gray-100 p-1 rounded transition-colors"
                            >
                              {expandedCategories.includes(category.id) ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-8 h-8 rounded object-cover border border-gray-200 bg-gray-50"
                              />
                            ) : (
                              <span className="text-2xl">📂</span>
                            )}
                            <h3 className="text-sm font-semibold text-[#c20001]">
                              {category.name}
                            </h3>
                            <Badge
                              className={
                                category.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {category.services.length} services
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 ml-9">
                            {category.description}
                          </p>
                          <p className="text-xs text-gray-500 ml-9 mt-1">
                            ID: {category.id}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCategory(category.id)}
                          >
                            {category.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    {expandedCategories.includes(category.id) && (
                      <div className="px-4 pb-4">
                        <div className="ml-9 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-gray-800">
                              Services
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddService(category.id)}
                              className="text-[#c20001] border-[#c20001]"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add service
                            </Button>
                          </div>

                          {category.services.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No services yet. Click{" "}
                              <span className="font-semibold">
                                Add service
                              </span>{" "}
                              to create one.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {category.services.map((service) => (
                                <div
                                  key={service.id}
                                  className="border rounded-lg border-gray-200 bg-white"
                                >
                                  {/* Service header */}
                                  <div className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <button
                                            onClick={() =>
                                              toggleServiceExpand(service.id)
                                            }
                                            className="hover:bg-gray-100 p-0.5 rounded transition-colors"
                                          >
                                            {expandedServices.includes(
                                              service.id
                                            ) ? (
                                              <ChevronDown className="w-4 h-4 text-gray-600" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-gray-600" />
                                            )}
                                          </button>
                                          <p className="text-sm text-gray-900">
                                            {service.name}
                                          </p>
                                          <Badge className="bg-purple-100 text-purple-800">
                                            {service.subServices.length}{" "}
                                            sub-services
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 ml-6">
                                          {service.description}
                                        </p>
                                        <p className="text-xs text-gray-500 ml-6 mt-0.5">
                                          ID: {service.id}
                                        </p>
                                      </div>
                                      <div className="flex flex-col sm:flex-row gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleEditService(
                                              category.id,
                                              service
                                            )
                                          }
                                        >
                                          <Pencil className="w-3.5 h-3.5 mr-1" />
                                          Edit
                                        </Button>
                                        {/* TODO: when backend adds service.isActive + endpoints,
                                            add an Activate/Deactivate button here. */}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-500 text-red-600 hover:bg-red-50"
                                          onClick={() =>
                                            handleDeleteService(
                                              category.id,
                                              service.id
                                            )
                                          }
                                        >
                                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sub-services */}
                                  {expandedServices.includes(service.id) && (
                                    <div className="px-3 pb-3">
                                      <div className="ml-6 border-t pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="text-xs text-gray-700">
                                            Sub-services
                                          </h5>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handleAddSubService(
                                                category.id,
                                                service.id
                                              )
                                            }
                                            className="text-[#c20001] border-[#c20001] h-7 text-xs"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add sub-service
                                          </Button>
                                        </div>

                                        {service.subServices.length === 0 ? (
                                          <p className="text-xs text-gray-500 text-center py-3">
                                            No sub-services yet. Click{" "}
                                            <span className="font-semibold">
                                              Add sub-service
                                            </span>{" "}
                                            to create one.
                                          </p>
                                        ) : (
                                          <div className="space-y-2">
                                            {service.subServices.map((ss) => (
                                              <div
                                                key={ss.id}
                                                className="p-2 border rounded border-gray-200 bg-white"
                                              >
                                                <div className="flex items-start justify-between gap-3">
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <p className="text-xs font-medium text-gray-900">
                                                        {ss.name}
                                                      </p>
                                                      {/* TODO: when backend adds subservice.isActive + endpoints,
                                                          show an Active/Inactive badge here. */}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">
                                                      {ss.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                                                      {ss.baseRate != null && (
                                                        <span>
                                                          Price:{" "}
                                                          <span className="text-[#c20001] font-semibold">
                                                            {ss.baseRate}
                                                          </span>
                                                        </span>
                                                      )}
                                                      <span>ID: {ss.id}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col sm:flex-row gap-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="h-7"
                                                      onClick={() =>
                                                        handleEditSubService(
                                                          category.id,
                                                          service.id,
                                                          ss
                                                        )
                                                      }
                                                    >
                                                      <Pencil className="w-3.5 h-3.5 mr-1" />
                                                      Edit
                                                    </Button>
                                                    {/* TODO: when backend adds subservice.isActive + endpoints,
                                                        add Activate/Deactivate button here. */}
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="h-7 text-xs border-red-500 text-red-600 hover:bg-red-50"
                                                      onClick={() =>
                                                        handleDeleteSubService(
                                                          category.id,
                                                          service.id,
                                                          ss.id
                                                        )
                                                      }
                                                    >
                                                      <Trash2 className="w-3 h-3 mr-1" />
                                                      Delete
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {categories.length > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                  <span>
                    Showing{" "}
                    <span className="font-semibold">
                      {pageStartIndex + 1}
                    </span>{" "}
                    –{" "}
                    <span className="font-semibold">
                      {Math.min(pageStartIndex + PAGE_SIZE, categories.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {categories.length}
                    </span>{" "}
                    categories
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Previous
                    </Button>
                    <span>
                      Page{" "}
                      <span className="font-semibold">{currentPage}</span> of{" "}
                      <span className="font-semibold">{totalPages}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Modal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit category" : "Add category"}
        description={
          editingCategory
            ? "Update category copy and image. Live pricing now lives on sub-services."
            : "Create a new top-level category for your catalog."
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Category name *</Label>
            <Input
              id="cat-name"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. General Maintenance"
            />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description *</Label>
            <Textarea
              id="cat-desc"
              rows={3}
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Short description used in customer app."
            />
          </div>
          <div>
            <Label htmlFor="cat-image">Image URL</Label>
            <Input
              id="cat-image"
              value={categoryForm.image}
              onChange={(e) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  image: e.target.value,
                }))
              }
              placeholder="https://example.com/category-image.jpg"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Optional. Stored as <code>image</code> in the backend and shown as
              the category thumbnail.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSavingCategory}>
              {editingCategory ? "Update category" : "Create category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Service Modal */}
      <Modal
        open={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={editingService.service ? "Edit service" : "Add service"}
        description={
          editingService.service
            ? "Update the service name and description."
            : "Create a mid-level service under this category."
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="srv-name">Service name *</Label>
            <Input
              id="srv-name"
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Repairs & Fixes"
            />
          </div>
          <div>
            <Label htmlFor="srv-desc">Description *</Label>
            <Textarea
              id="srv-desc"
              rows={3}
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Explain what is included in this service."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveService} disabled={isSavingService}>
              {editingService.service ? "Update service" : "Create service"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sub-service Modal */}
      <Modal
        open={isSubServiceModalOpen}
        onClose={() => setIsSubServiceModalOpen(false)}
        title={
          editingSubService.subService
            ? "Edit sub-service"
            : "Add sub-service"
        }
        description={
          editingSubService.subService
            ? "Update copy and base price for this sub-service."
            : "Create the final bookable unit with base price."
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="sub-name">Sub-service name *</Label>
            <Input
              id="sub-name"
              value={subServiceForm.name}
              onChange={(e) =>
                setSubServiceForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Door Repair"
            />
          </div>
          <div>
            <Label htmlFor="sub-desc">Description *</Label>
            <Textarea
              id="sub-desc"
              rows={3}
              value={subServiceForm.description}
              onChange={(e) =>
                setSubServiceForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Detailed description shown to customer and dispatcher."
            />
          </div>
          <div>
            <Label htmlFor="sub-price">Base price (optional)</Label>
            <Input
              id="sub-price"
              type="number"
              min="0"
              step="0.01"
              value={subServiceForm.baseRate}
              onChange={(e) =>
                setSubServiceForm((prev) => ({
                  ...prev,
                  baseRate: e.target.value,
                }))
              }
              placeholder="0"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Stored in the backend as <code>baseRate</code> on the sub-service.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSubServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubService}
              disabled={isSavingSubService}
            >
              {editingSubService.subService
                ? "Update sub-service"
                : "Create sub-service"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCategoriesManagementPage;
