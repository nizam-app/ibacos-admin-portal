// src/api/serviceMetaApi.js
// 👉 Category → Service → Subservice meta build করে
// /categories endpoint থেকে।
// ServiceRequestForm এ use করব:
//   fetchCategories(), fetchServices(categoryId), fetchSubservices(serviceId)

import axiosClient from "./axiosClient";

let metaCache = null;

const buildMetaFromCategories = (categoriesRaw) => {
  const categories = [];
  const servicesByCategory = {};
  const subservicesByService = {};

  (categoriesRaw || []).forEach((cat) => {
    if (!cat || !cat.id) return;

    // ---- category list ----
    categories.push({
      id: cat.id,
      name: cat.name,
      description: cat.description ?? "",
      isActive: !!cat.isActive,
    });

    const catIdKey = String(cat.id);
    const services = Array.isArray(cat.services) ? cat.services : [];

    servicesByCategory[catIdKey] = services
      .map((srv) => {
        if (!srv || !srv.id) return null;

        const srvObj = {
          id: srv.id,
          categoryId: cat.id,
          name: srv.name,
          description: srv.description ?? "",
        };

        const srvIdKey = String(srv.id);
        const subs = Array.isArray(srv.subservices) ? srv.subservices : [];

        subservicesByService[srvIdKey] = subs.map((sub) => ({
          id: sub.id,
          serviceId: srv.id,
          categoryId: cat.id,
          name: sub.name,
          description: sub.description ?? "",
          baseRate: sub.baseRate ?? null,
        }));

        return srvObj;
      })
      .filter(Boolean);
  });

  // dropdown গুলো stable রাখার জন্য sort
  categories.sort((a, b) => a.name.localeCompare(b.name));
  Object.keys(servicesByCategory).forEach((catId) => {
    servicesByCategory[catId].sort((a, b) => a.name.localeCompare(b.name));
  });
  Object.keys(subservicesByService).forEach((srvId) => {
    subservicesByService[srvId].sort((a, b) => a.name.localeCompare(b.name));
  });

  return { categories, servicesByCategory, subservicesByService };
};

const ensureMetaLoaded = async () => {
  if (metaCache) return metaCache;

  // 👉 axiosClient.baseURL already .../api,
  // তাই এখানে শুধু "/categories" দেবো, "/api/categories" না।
  const res = await axiosClient.get("/categories");

  // AdminCategoriesManagementPage ও res.data array ধরে নিচ্ছে,
  // তাই আমরাও একই assumption নিলাম।
  const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
  metaCache = buildMetaFromCategories(raw);

  return metaCache;
};

// ==== PUBLIC API (axios-এর মত করে { data } return করছি) ====

export const fetchCategories = async () => {
  const meta = await ensureMetaLoaded();
  return { data: meta.categories };
};

export const fetchServices = async (categoryId) => {
  const meta = await ensureMetaLoaded();
  const key = String(categoryId);
  return { data: meta.servicesByCategory[key] || [] };
};

export const fetchSubservices = async (serviceId) => {
  const meta = await ensureMetaLoaded();
  const key = String(serviceId);
  return { data: meta.subservicesByService[key] || [] };
};

// optional: admin panel theke categories update করলে reload করার জন্য
export const refreshServiceMeta = async () => {
  metaCache = null;
  return ensureMetaLoaded();
};
