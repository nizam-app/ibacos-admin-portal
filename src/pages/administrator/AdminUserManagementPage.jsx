// src/pages/administrator/AdminUserManagementPage.jsx
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  UserPlus,
  Shield,
  Users,
  Search,
  Edit2,
  Lock,
} from "lucide-react";

// ------------------------------------------------------------------
// Small Tailwind UI helpers (Card, Button, Badge, Input, Select)
// ------------------------------------------------------------------
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
    sm: "h-9 px-3 text-sm",
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

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const Select = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={
      "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/40 outline-none " +
      className
    }
  >
    {children}
  </select>
);

// ------------------------------------------------------------------
// Modal (Add / Edit user)
// ------------------------------------------------------------------
const Modal = ({ open, title, description, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center">
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

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
            {/* footer buttons injected via children if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Types (JSDoc style for plain JS)
// ------------------------------------------------------------------
/**
 * @typedef {'Call Center Agent' | 'Dispatcher' | 'Administrator'} UserRole
 * @typedef {'Active' | 'Inactive'} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {UserRole} role
 * @property {UserStatus} status
 * @property {string} createdDate
 * @property {string=} lastLogin
 */

// ------------------------------------------------------------------
// Page Component
// ------------------------------------------------------------------
const AdminUserManagementPage = () => {
  /** @type {[User[], Function]} */
  const [users, setUsers] = useState([
    {
      id: "USER001",
      name: "Sarah Williams",
      email: "sarah.williams@serviopro.com",
      phone: "+971 50 111 2222",
      role: "Call Center Agent",
      status: "Active",
      createdDate: "2024-01-15",
      lastLogin: "2024-11-08 09:30 AM",
    },
    {
      id: "USER002",
      name: "John Mitchell",
      email: "john.mitchell@serviopro.com",
      phone: "+971 50 222 3333",
      role: "Dispatcher",
      status: "Active",
      createdDate: "2024-02-20",
      lastLogin: "2024-11-08 08:15 AM",
    },
    {
      id: "USER003",
      name: "Admin User",
      email: "admin@serviopro.com",
      phone: "+971 50 333 4444",
      role: "Administrator",
      status: "Active",
      createdDate: "2023-12-01",
      lastLogin: "2024-11-08 10:00 AM",
    },
    {
      id: "USER004",
      name: "Emma Davis",
      email: "emma.davis@serviopro.com",
      phone: "+971 50 444 5555",
      role: "Call Center Agent",
      status: "Active",
      createdDate: "2024-03-10",
      lastLogin: "2024-11-07 04:30 PM",
    },
    {
      id: "USER005",
      name: "Michael Brown",
      email: "michael.brown@serviopro.com",
      phone: "+971 50 555 6666",
      role: "Dispatcher",
      status: "Inactive",
      createdDate: "2024-04-05",
      lastLogin: "2024-10-25 02:15 PM",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** @type {[User|null, Function]} */
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: /** @type {UserRole} */ ("Call Center Agent"),
    password: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(s) ||
        user.email.toLowerCase().includes(s) ||
        user.id.toLowerCase().includes(s);

      const matchesRole =
        filterRole === "all" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const roleStats = useMemo(
    () => ({
      total: users.length,
      agents: users.filter((u) => u.role === "Call Center Agent").length,
      dispatchers: users.filter((u) => u.role === "Dispatcher").length,
      admins: users.filter((u) => u.role === "Administrator").length,
    }),
    [users]
  );

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const getRoleBadge = (role) => {
    switch (role) {
      case "Administrator":
        return (
          <Badge className="bg-[#c20001] text-white">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "Dispatcher":
        return (
          <Badge className="bg-blue-600 text-white">
            <Users className="w-3 h-3 mr-1" />
            Dispatcher
          </Badge>
        );
      case "Call Center Agent":
      default:
        return (
          <Badge className="bg-purple-600 text-white">
            <Users className="w-3 h-3 mr-1" />
            Agent
          </Badge>
        );
    }
  };

  const getStatusBadge = (status) =>
    status === "Active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Call Center Agent",
      password: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in name, email and phone.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      await Swal.fire({
        icon: "error",
        title: "Password required",
        text: "Password is mandatory when creating a new user.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      );
      await Swal.fire({
        icon: "success",
        title: "User updated",
        text: "User information has been updated.",
        confirmButtonColor: "#c20001",
      });
    } else {
      const newUser = {
        id: `USER${String(users.length + 1).padStart(3, "0")}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: "Active",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setUsers((prev) => [...prev, newUser]);
      await Swal.fire({
        icon: "success",
        title: "User created",
        text: "New user account has been created.",
        confirmButtonColor: "#c20001",
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const willDeactivate = user.status === "Active";

    const result = await Swal.fire({
      icon: willDeactivate ? "warning" : "question",
      title: willDeactivate ? "Deactivate user?" : "Activate user?",
      text: willDeactivate
        ? "User will lose access to the admin portal until reactivated."
        : "User will regain access to the admin portal.",
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: willDeactivate ? "Yes, deactivate" : "Yes, activate",
    });

    if (!result.isConfirmed) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: willDeactivate ? "Inactive" : "Active",
            }
          : u
      )
    );

    await Swal.fire({
      icon: "success",
      title: willDeactivate ? "User deactivated" : "User activated",
      text: `${user.name} has been ${
        willDeactivate ? "deactivated" : "activated"
      }.`,
      confirmButtonColor: "#c20001",
    });
  };

  const handleResetPassword = async (user) => {
    await Swal.fire({
      icon: "info",
      title: "Password reset link sent",
      text: `Mock action: reset link sent to ${user.email}. Connect with your auth backend to send real emails.`,
      confirmButtonColor: "#c20001",
    });
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            User Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage back-office users, roles and access permissions.
          </p>
          <p className="mt-1 inline-flex items-center text-xs text-amber-800 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Only{" "}
            <span className="font-semibold mx-1">Administrators</span>
            can create or edit Dispatcher and Admin accounts.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add user
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl text-[#c20001] font-semibold">
                {roleStats.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl text-purple-600 font-semibold">
                {roleStats.agents}
              </p>
              <p className="text-sm text-gray-600 mt-1">Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl text-blue-600 font-semibold">
                {roleStats.dispatchers}
              </p>
              <p className="text-sm text-gray-600 mt-1">Dispatchers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl text-[#c20001] font-semibold">
                {roleStats.admins}
              </p>
              <p className="text-sm text-gray-600 mt-1">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-52">
              <Select
                value={filterRole}
                onChange={setFilterRole}
              >
                <option value="all">All roles</option>
                <option value="Call Center Agent">Agents</option>
                <option value="Dispatcher">Dispatchers</option>
                <option value="Administrator">Administrators</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users{" "}
            <span className="text-sm font-normal text-gray-500">
              ({filteredUsers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-[#c20001]">
                        {user.name}
                      </h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-500">User ID</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {user.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {user.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last login</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {user.lastLogin || "Never"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 min-w-[180px] md:items-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetPassword(user)}
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      Reset password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        user.status === "Active"
                          ? "border-red-600 text-red-600"
                          : "border-green-600 text-green-600"
                      }
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.status === "Active"
                        ? "Deactivate"
                        : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">
                No users match the current filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit user modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit user" : "Add new user"}
        description={
          editingUser
            ? "Update user information and role."
            : "Create a new back-office user account."
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="user@serviopro.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="+971 50 123 4567"
            />
          </div>
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role: value,
                }))
              }
            >
              <option value="Call Center Agent">
                Call Center Agent
              </option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Administrator">Administrator</option>
            </Select>
          </div>

          {!editingUser && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Initial password for the user"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? "Update user" : "Create user"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUserManagementPage;
