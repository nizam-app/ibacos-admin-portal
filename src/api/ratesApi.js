import axiosClient from "./axiosClient";

const RatesAPI = {
  // Summary of counts & averages
  getSummary: () => axiosClient.get("/rates/summary"),

  // All rate structures (optionally with ?type= & ?techType=)
  getAllRates: (params = {}) => axiosClient.get("/rates", { params }),

  getCommissionRates: () =>
    axiosClient.get("/rates", {
      params: { type: "COMMISSION", techType: "FREELANCER" },
    }),

  getBonusRates: () =>
    axiosClient.get("/rates", {
      params: { type: "BONUS", techType: "INTERNAL" },
    }),

  getRateById: (id) => axiosClient.get(`/rates/${id}`),

  createRate: (payload) => axiosClient.post("/rates", payload),

  updateRate: (id, payload) => axiosClient.patch(`/rates/${id}`, payload),

  deleteRate: (id) => axiosClient.delete(`/rates/${id}`),

  setDefaultRate: (id) =>
    axiosClient.patch(`/rates/${id}/set-default`, {}),

  getDefaultForFreelancers: () =>
    axiosClient.get("/rates/default/FREELANCER"),

  getDefaultForInternals: () =>
    axiosClient.get("/rates/default/INTERNAL"),
};

export default RatesAPI;
