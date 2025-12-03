// src/pages/administrator/AdminCategoriesManagementPage.jsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  FolderKanban,
  Plus,
  Pencil,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------
// Small Tailwind UI helpers (local, no ../ui imports)
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
    "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors";
  const variants = {
    solid: "bg-[#c20001] text-white hover:bg-[#a00001]",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
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

// Simple modal component (for all 3 modals)
const Modal = ({ open, title, description, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
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
// Types (JSDoc style so .jsx works fine)
// ---------------------------------------------------------

/**
 * @typedef {Object} SubService
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} basePrice
 * @property {string} estimatedDuration
 * @property {boolean} active
 */

/**
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} active
 * @property {SubService[]} subServices
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {boolean} active
 * @property {Service[]} services
 */

// ---------------------------------------------------------
// Page Component
// ---------------------------------------------------------

const AdminCategoriesManagementPage = () => {
  /** @type {[Category[], Function]} */
  const [categories, setCategories] = useState([
    {
      id: "CAT001",
      name: "General Maintenance",
      description: "General home and office maintenance services",
      icon: "🔧",
      active: true,
      services: [
        {
          id: "SER001",
          name: "Repairs & Fixes",
          description: "General repair and fixing services",
          active: true,
          subServices: [
            {
              id: "SUB001",
              name: "Door Repair",
              description: "Fix door hinges, locks, and frames",
              basePrice: 220,
              estimatedDuration: "1.5 hours",
              active: true,
            },
            {
              id: "SUB002",
              name: "Window Repair",
              description: "Repair windows and frames",
              basePrice: 180,
              estimatedDuration: "1 hour",
              active: true,
            },
          ],
        },
        {
          id: "SER002",
          name: "Lock Services",
          description: "Lock installation and replacement",
          active: true,
          subServices: [
            {
              id: "SUB003",
              name: "Lock Replacement",
              description: "Replace door locks and keys",
              basePrice: 250,
              estimatedDuration: "1 hour",
              active: true,
            },
            {
              id: "SUB004",
              name: "Lock Installation",
              description: "Install new locks",
              basePrice: 200,
              estimatedDuration: "1 hour",
              active: true,
            },
          ],
        },
      ],
    },
    {
      id: "CAT002",
      name: "AC Service",
      description: "Air conditioning installation, repair, and maintenance",
      icon: "❄️",
      active: true,
      services: [
        {
          id: "SER003",
          name: "Installation",
          description: "Complete AC unit installation services",
          active: true,
          subServices: [
            {
              id: "SUB005",
              name: "Split AC Installation",
              description: "Install split AC units",
              basePrice: 800,
              estimatedDuration: "4 hours",
              active: true,
            },
            {
              id: "SUB006",
              name: "Window AC Installation",
              description: "Install window AC units",
              basePrice: 400,
              estimatedDuration: "2 hours",
              active: true,
            },
          ],
        },
        {
          id: "SER004",
          name: "Repair & Maintenance",
          description: "AC repair and regular maintenance",
          active: true,
          subServices: [
            {
              id: "SUB007",
              name: "AC Repair",
              description: "AC troubleshooting and repair",
              basePrice: 350,
              estimatedDuration: "2 hours",
              active: true,
            },
            {
              id: "SUB008",
              name: "AC Maintenance",
              description: "Regular AC servicing and gas refill",
              basePrice: 280,
              estimatedDuration: "1.5 hours",
              active: true,
            },
          ],
        },
      ],
    },
    {
      id: "CAT003",
      name: "Plumbing",
      description: "Plumbing repairs, installations, and maintenance",
      icon: "🚰",
      active: true,
      services: [
        {
          id: "SER005",
          name: "Pipe Services",
          description: "Pipe repair and installation",
          active: true,
          subServices: [
            {
              id: "SUB009",
              name: "Pipe Leak Repair",
              description: "Fix leaking pipes and faucets",
              basePrice: 250,
              estimatedDuration: "1.5 hours",
              active: true,
            },
            {
              id: "SUB010",
              name: "Pipe Installation",
              description: "Install new pipes",
              basePrice: 400,
              estimatedDuration: "3 hours",
              active: true,
            },
          ],
        },
        {
          id: "SER006",
          name: "Drain Services",
          description: "Drain cleaning and maintenance",
          active: true,
          subServices: [
            {
              id: "SUB011",
              name: "Drain Cleaning",
              description: "Clear blocked drains and pipes",
              basePrice: 300,
              estimatedDuration: "2 hours",
              active: true,
            },
          ],
        },
      ],
    },
    {
      id: "CAT004",
      name: "Electrical",
      description: "Electrical repairs, installations, and wiring",
      icon: "⚡",
      active: true,
      services: [
        {
          id: "SER007",
          name: "Lighting",
          description: "Light installation and repair",
          active: true,
          subServices: [
            {
              id: "SUB012",
              name: "Light Installation",
              description: "Install new light fixtures",
              basePrice: 180,
              estimatedDuration: "1 hour",
              active: true,
            },
            {
              id: "SUB013",
              name: "Light Repair",
              description: "Fix existing lights",
              basePrice: 120,
              estimatedDuration: "0.5 hours",
              active: true,
            },
          ],
        },
        {
          id: "SER008",
          name: "Wiring & Panels",
          description: "Electrical wiring and panel services",
          active: true,
          subServices: [
            {
              id: "SUB014",
              name: "Electrical Panel Repair",
              description: "Repair or replacement of electrical panels",
              basePrice: 450,
              estimatedDuration: "2 hours",
              active: true,
            },
            {
              id: "SUB015",
              name: "Socket Installation",
              description: "Install electrical sockets and switches",
              basePrice: 150,
              estimatedDuration: "1 hour",
              active: true,
            },
          ],
        },
      ],
    },
  ]);

  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedServices, setExpandedServices] = useState([]);

  // Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubServiceModalOpen, setIsSubServiceModalOpen] = useState(false);

  /** @type {[Category|null, Function]} */
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
    icon: "",
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
  });

  const [subServiceForm, setSubServiceForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    estimatedDuration: "",
  });

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
    setCategoryForm({ name: "", description: "", icon: "" });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
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

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...categoryForm }
            : c
        )
      );
      await Swal.fire({
        icon: "success",
        title: "Category updated",
        confirmButtonColor: "#c20001",
      });
    } else {
      const newCategory = {
        id: `CAT${String(categories.length + 1).padStart(3, "0")}`,
        ...categoryForm,
        active: true,
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
  };

  const handleToggleCategory = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const willDeactivate = category.active;

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

    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );

    await Swal.fire({
      icon: "success",
      title: willDeactivate ? "Category deactivated" : "Category activated",
      confirmButtonColor: "#c20001",
    });
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

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== editingService.categoryId) return category;

        if (editingService.service) {
          // Update
          return {
            ...category,
            services: category.services.map((s) =>
              s.id === editingService.service.id
                ? { ...s, ...serviceForm }
                : s
            ),
          };
        } else {
          // Create
          const newService = {
            id: `SER${String(Date.now()).slice(-3)}`,
            ...serviceForm,
            active: true,
            subServices: [],
          };
          return {
            ...category,
            services: [...category.services, newService],
          };
        }
      })
    );

    await Swal.fire({
      icon: "success",
      title: editingService.service
        ? "Service updated"
        : "Service created",
      confirmButtonColor: "#c20001",
    });

    setIsServiceModalOpen(false);
  };

  const handleToggleService = async (categoryId, serviceId) => {
    const category = categories.find((c) => c.id === categoryId);
    const service = category?.services.find((s) => s.id === serviceId);
    if (!category || !service) return;

    const willDeactivate = service.active;

    const result = await Swal.fire({
      icon: willDeactivate ? "warning" : "question",
      title: willDeactivate ? "Deactivate service?" : "Activate service?",
      text: willDeactivate
        ? "Customers should not be able to book this service while inactive."
        : "Service will be available again under this category.",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: willDeactivate ? "Yes, deactivate" : "Yes, activate",
    });

    if (!result.isConfirmed) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          services: cat.services.map((s) =>
            s.id === serviceId ? { ...s, active: !s.active } : s
          ),
        };
      })
    );

    await Swal.fire({
      icon: "success",
      title: willDeactivate ? "Service deactivated" : "Service activated",
      confirmButtonColor: "#c20001",
    });
  };

  // -----------------------------------------------------
  // Sub-service management
  // -----------------------------------------------------
  const handleAddSubService = (categoryId, serviceId) => {
    setEditingSubService({ categoryId, serviceId, subService: null });
    setSubServiceForm({
      name: "",
      description: "",
      basePrice: "",
      estimatedDuration: "",
    });
    setIsSubServiceModalOpen(true);
  };

  const handleEditSubService = (categoryId, serviceId, subService) => {
    setEditingSubService({ categoryId, serviceId, subService });
    setSubServiceForm({
      name: subService.name,
      description: subService.description,
      basePrice: String(subService.basePrice),
      estimatedDuration: subService.estimatedDuration,
    });
    setIsSubServiceModalOpen(true);
  };

  const handleSaveSubService = async () => {
    if (
      !subServiceForm.name ||
      !subServiceForm.description ||
      !subServiceForm.basePrice ||
      !subServiceForm.estimatedDuration
    ) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in all sub-service fields.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    const price = parseFloat(subServiceForm.basePrice);
    if (Number.isNaN(price)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid price",
        text: "Base price must be a valid number.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== editingSubService.categoryId) return category;

        return {
          ...category,
          services: category.services.map((service) => {
            if (service.id !== editingSubService.serviceId) return service;

            if (editingSubService.subService) {
              // Update
              return {
                ...service,
                subServices: service.subServices.map((ss) =>
                  ss.id === editingSubService.subService.id
                    ? {
                        ...ss,
                        name: subServiceForm.name,
                        description: subServiceForm.description,
                        basePrice: price,
                        estimatedDuration:
                          subServiceForm.estimatedDuration,
                      }
                    : ss
                ),
              };
            } else {
              // Create
              const newSub = {
                id: `SUB${String(Date.now()).slice(-3)}`,
                name: subServiceForm.name,
                description: subServiceForm.description,
                basePrice: price,
                estimatedDuration: subServiceForm.estimatedDuration,
                active: true,
              };
              return {
                ...service,
                subServices: [...service.subServices, newSub],
              };
            }
          }),
        };
      })
    );

    await Swal.fire({
      icon: "success",
      title: editingSubService.subService
        ? "Sub-service updated"
        : "Sub-service created",
      confirmButtonColor: "#c20001",
    });

    setIsSubServiceModalOpen(false);
  };

  const handleToggleSubService = async (categoryId, serviceId, subId) => {
    const category = categories.find((c) => c.id === categoryId);
    const service = category?.services.find((s) => s.id === serviceId);
    const sub = service?.subServices.find((ss) => ss.id === subId);
    if (!category || !service || !sub) return;

    const willDeactivate = sub.active;

    const result = await Swal.fire({
      icon: willDeactivate ? "warning" : "question",
      title: willDeactivate ? "Deactivate sub-service?" : "Activate sub-service?",
      text: willDeactivate
        ? "This option should be hidden from new bookings while inactive."
        : "Sub-service will be available again under this service.",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: willDeactivate ? "Yes, deactivate" : "Yes, activate",
    });

    if (!result.isConfirmed) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          services: cat.services.map((srv) => {
            if (srv.id !== serviceId) return srv;
            return {
              ...srv,
              subServices: srv.subServices.map((ss) =>
                ss.id === subId ? { ...ss, active: !ss.active } : ss
              ),
            };
          }),
        };
      })
    );

    await Swal.fire({
      icon: "success",
      title: willDeactivate
        ? "Sub-service deactivated"
        : "Sub-service activated",
      confirmButtonColor: "#c20001",
    });
  };

  // -----------------------------------------------------
  // Stats
  // -----------------------------------------------------
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.active).length;
    const totalServices = categories.reduce(
      (sum, cat) => sum + cat.services.length,
      0
    );
    const activeServices = categories.reduce(
      (sum, cat) => sum + cat.services.filter((s) => s.active).length,
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
    const activeSubServices = categories.reduce(
      (sum, cat) =>
        sum +
        cat.services.reduce(
          (sSum, s) => sSum + s.subServices.filter((ss) => ss.active).length,
          0
        ),
      0
    );

    return {
      totalCategories,
      activeCategories,
      totalServices,
      activeServices,
      totalSubServices,
      activeSubServices,
    };
  }, [categories]);

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
          Manage <span className="font-semibold">Category → Service → Sub-Service</span>{" "}
          including pricing and duration. This feeds your booking app catalog.
        </p>
        <p className="mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-100 inline-flex items-center px-2 py-1 rounded-lg">
          Only{" "}
          <span className="mx-1 font-semibold">Administrators</span>
          should publish structural changes to production.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <CardDescription>Active Services</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.activeServices}
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
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Sub-services</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.activeSubServices}
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
              Category → Service → Sub-service, with status toggles for each
              level.
            </CardDescription>
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Add category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`border rounded-lg ${
                  category.active
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
                          onClick={() => toggleCategoryExpand(category.id)}
                          className="hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                          {expandedCategories.includes(category.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="text-sm font-semibold text-[#c20001]">
                          {category.name}
                        </h3>
                        <Badge
                          className={
                            category.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {category.active ? "Active" : "Inactive"}
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
                        {category.active ? "Deactivate" : "Activate"}
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
                          <span className="font-semibold">Add service</span> to
                          create one.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {category.services.map((service) => (
                            <div
                              key={service.id}
                              className={`border rounded-lg ${
                                service.active
                                  ? "border-gray-200 bg-white"
                                  : "border-gray-200 bg-gray-50 opacity-70"
                              }`}
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
                                      <Badge
                                        className={
                                          service.active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-700"
                                        }
                                      >
                                        {service.active
                                          ? "Active"
                                          : "Inactive"}
                                      </Badge>
                                      <Badge className="bg-purple-100 text-purple-800">
                                        {service.subServices.length} sub-services
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
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleToggleService(
                                          category.id,
                                          service.id
                                        )
                                      }
                                    >
                                      {service.active
                                        ? "Deactivate"
                                        : "Activate"}
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
                                            className={`p-2 border rounded ${
                                              ss.active
                                                ? "border-gray-200 bg-white"
                                                : "border-gray-200 bg-gray-50 opacity-70"
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <p className="text-xs font-medium text-gray-900">
                                                    {ss.name}
                                                  </p>
                                                  <Badge
                                                    className={
                                                      ss.active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-700"
                                                    }
                                                  >
                                                    {ss.active
                                                      ? "Active"
                                                      : "Inactive"}
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                  {ss.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                                                  <span>
                                                    Price:{" "}
                                                    <span className="text-[#c20001] font-semibold">
                                                      ${ss.basePrice}
                                                    </span>
                                                  </span>
                                                  <span>
                                                    Duration:{" "}
                                                    {ss.estimatedDuration}
                                                  </span>
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
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 text-xs"
                                                  onClick={() =>
                                                    handleToggleSubService(
                                                      category.id,
                                                      service.id,
                                                      ss.id
                                                    )
                                                  }
                                                >
                                                  {ss.active
                                                    ? "Deactivate"
                                                    : "Activate"}
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
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Modal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit category" : "Add category"}
        description={
          editingCategory
            ? "Update category copy and icon. Live pricing lives on sub-services."
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
            <Label htmlFor="cat-icon">Icon (emoji)</Label>
            <Input
              id="cat-icon"
              maxLength={3}
              value={categoryForm.icon}
              onChange={(e) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  icon: e.target.value,
                }))
              }
              placeholder="e.g. 🔧"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Optional. One emoji that visually represents this category.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
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
            <Button onClick={handleSaveService}>
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
            ? "Update pricing and description for this sub-service."
            : "Create the final bookable unit with base price and duration."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sub-price">Base price (USD) *</Label>
              <Input
                id="sub-price"
                type="number"
                min="0"
                step="0.01"
                value={subServiceForm.basePrice}
                onChange={(e) =>
                  setSubServiceForm((prev) => ({
                    ...prev,
                    basePrice: e.target.value,
                  }))
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="sub-duration">Estimated duration *</Label>
              <Input
                id="sub-duration"
                value={subServiceForm.estimatedDuration}
                onChange={(e) =>
                  setSubServiceForm((prev) => ({
                    ...prev,
                    estimatedDuration: e.target.value,
                  }))
                }
                placeholder="e.g. 1.5 hours"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSubServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubService}>
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
