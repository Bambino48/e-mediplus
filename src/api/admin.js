import api from "./axiosInstance.js";

export async function listUsers(params = {}) {
  const res = await api.get(`/admin/users`, { params });
  // Backend may return { users: [...] } or a paginated response
  if (Array.isArray(res.data)) return res.data;
  if (res.data.users) return res.data.users;
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await api.put(`/admin/users/${id}`, { role });
  return res.data;
}

export async function getReports(params = {}) {
  const res = await api.get(`/admin/reports`, { params });
  // Expecting summary object like { users: N, doctors: N, pharmacies: N, ... }
  return res.data;
}

export async function listPharmacies(params = {}) {
  const res = await api.get(`/admin/pharmacies`, { params });
  // Expecting paginated shape { items: [], total, ... } or an array
  return res.data;
}

export async function createPharmacy(data) {
  const res = await api.post(`/admin/pharmacies`, data);
  return res.data;
}

export async function deletePharmacy(id) {
  const res = await api.delete(`/admin/pharmacies/${id}`);
  return res.data;
}

export async function toggleUserVerification(id) {
  const res = await api.post(`/admin/users/${id}/toggle-verification`);
  return res.data;
}
