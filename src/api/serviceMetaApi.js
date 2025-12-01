// src/api/serviceMetaApi.js
// 👉 Ei file sudhu /api/sr theke metadata build kore
// ServiceRequestForm theke same interface (fetchCategories, fetchSubservices, fetchServices) use korte parba

import axiosClient from "./axiosClient";

let metaCache = null;

// helper: SR list theke unique meta build
const buildMetaFromSRs = (srs) => {
  const categoriesMap = new Map();              // categoryId -> { id, name }
  const subservicesByCategoryMap = new Map();   // categoryId -> Map(subserviceId -> obj)
  const servicesBySubserviceMap = new Map();    // subserviceId -> Map(serviceId -> obj)

  srs.forEach((sr) => {
    const category = sr.category;
    const subservice = sr.subservice;
    const service = sr.service;

    // ---------- CATEGORY ----------
    if (category && category.id) {
      if (!categoriesMap.has(category.id)) {
        categoriesMap.set(category.id, {
          id: category.id,
          name: category.name,
          description: category.description ?? "",
        });
      }
    }

    // ---------- SUBSERVICE ----------
    if (category && category.id && subservice && subservice.id) {
      if (!subservicesByCategoryMap.has(category.id)) {
        subservicesByCategoryMap.set(category.id, new Map());
      }
      const subMap = subservicesByCategoryMap.get(category.id);

      if (!subMap.has(subservice.id)) {
        subMap.set(subservice.id, {
          id: subservice.id,
          categoryId: category.id,
          name: subservice.name,
          description: subservice.description ?? "",
        });
      }
    }

    // ---------- SERVICE ----------
    // service sometimes null, so guard korlam
    if (subservice && subservice.id && service && service.id) {
      if (!servicesBySubserviceMap.has(subservice.id)) {
        servicesBySubserviceMap.set(subservice.id, new Map());
      }
      const srvMap = servicesBySubserviceMap.get(subservice.id);

      if (!srvMap.has(service.id)) {
        srvMap.set(service.id, {
          id: service.id,
          subserviceId: subservice.id,
          categoryId: category?.id ?? null,
          name: service.name,
          description: service.description ?? "",
          baseRate: service.baseRate ?? null,
        });
      }
    }
  });

  // map → array convert
  const categories = Array.from(categoriesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const subservicesByCategory = {};
  subservicesByCategoryMap.forEach((subMap, catId) => {
    subservicesByCategory[catId] = Array.from(subMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  const servicesBySubservice = {};
  servicesBySubserviceMap.forEach((srvMap, subId) => {
    servicesBySubservice[subId] = Array.from(srvMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  return { categories, subservicesByCategory, servicesBySubservice };
};

// ekbar call korle cache e thakbe
const ensureMetaLoaded = async () => {
  if (metaCache) return metaCache;

  const { data } = await axiosClient.get("/sr"); // List SRs
  const srs = Array.isArray(data) ? data : [];
  metaCache = buildMetaFromSRs(srs);
  return metaCache;
};

// ==== PUBLIC API (ServiceRequestForm ei gula use korbe) ====

export const fetchCategories = async () => {
  const meta = await ensureMetaLoaded();
  return { data: meta.categories }; // axios er moto shape
};

export const fetchSubservices = async (categoryId) => {
  const meta = await ensureMetaLoaded();
  return { data: meta.subservicesByCategory[categoryId] || [] };
};

export const fetchServices = async (subserviceId) => {
  const meta = await ensureMetaLoaded();
  return { data: meta.servicesBySubservice[subserviceId] || [] };
};

// optional: jodi future e reload korte chai (new SR ashbe etc.)
export const refreshServiceMeta = async () => {
  metaCache = null;
  return ensureMetaLoaded();
};
