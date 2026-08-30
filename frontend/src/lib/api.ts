const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "/api"
    : "http://127.0.0.1:8000/api");


export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("medreach_token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    fetchApi<{ access_token: string; token_type: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => fetchApi<any>("/auth/me"),

  // Medicines
  searchMedicines: (q: string) => fetchApi<any[]>(`/medicines/search?q=${encodeURIComponent(q)}`),
  getMedicines: () => fetchApi<any[]>("/medicines"),
  getMedicineCategories: () => fetchApi<any[]>("/medicines/categories"),
  getMedicineSubstitutes: (id: number) => fetchApi<any[]>(`/medicines/${id}/substitutes`),

  // Pharmacies & Nearby
  getNearbyPharmacies: (params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    medicine_id?: number;
    medicine_name?: string;
    urgent_mode?: boolean;
    quantity?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.latitude) query.append("latitude", params.latitude.toString());
    if (params.longitude) query.append("longitude", params.longitude.toString());
    if (params.radius) query.append("radius", params.radius.toString());
    if (params.medicine_id) query.append("medicine_id", params.medicine_id.toString());
    if (params.medicine_name) query.append("medicine_name", params.medicine_name);
    if (params.urgent_mode) query.append("urgent_mode", "true");
    if (params.quantity) query.append("quantity", params.quantity.toString());
    return fetchApi<any[]>(`/pharmacies/nearby?${query.toString()}`);
  },

  checkBasketAvailability: (items: Array<{ medicine_id: number; quantity: number }>, lat?: number, lon?: number, radius?: number) => {
    const query = new URLSearchParams();
    if (lat) query.append("latitude", lat.toString());
    if (lon) query.append("longitude", lon.toString());
    if (radius) query.append("radius", radius.toString());
    return fetchApi<any[]>(`/pharmacies/basket-availability?${query.toString()}`, {
      method: "POST",
      body: JSON.stringify(items),
    });
  },

  getAllPharmacies: () => fetchApi<any[]>("/pharmacies"),
  getMyPharmacy: () => fetchApi<any>("/pharmacies/my"),
  getPharmacyInventory: (pharmacyId: number) => fetchApi<any[]>(`/pharmacies/${pharmacyId}/inventory`),
  addOrUpdateInventory: (pharmacyId: number, data: { medicine_id: number; quantity: number; price: number; batch_number?: string; expiry_date?: string }) =>
    fetchApi<any>(`/pharmacies/${pharmacyId}/inventory`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInventoryItem: (pharmacyId: number, invId: number, data: any) =>
    fetchApi<any>(`/pharmacies/${pharmacyId}/inventory/${invId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteInventoryItem: (pharmacyId: number, invId: number) =>
    fetchApi<any>(`/pharmacies/${pharmacyId}/inventory/${invId}`, {
      method: "DELETE",
    }),
  importInventoryCsv: (pharmacyId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchApi<any>(`/pharmacies/${pharmacyId}/inventory/import-csv`, {
      method: "POST",
      body: formData,
    });
  },
  exportInventoryCsvUrl: (pharmacyId: number) => `${API_BASE}/pharmacies/${pharmacyId}/inventory/export-csv`,
  toggleVerifyPharmacy: (pharmacyId: number, status: string) =>
    fetchApi<any>(`/pharmacies/${pharmacyId}/verify?status_value=${status}`, {
      method: "PUT",
    }),

  // Prescriptions
  uploadPrescription: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchApi<any>("/prescriptions/upload", {
      method: "POST",
      body: formData,
    });
  },
  confirmPrescription: (prescriptionId: number, items: any[]) =>
    fetchApi<any>(`/prescriptions/${prescriptionId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  getMyDoctorPrescriptions: () => fetchApi<any[]>("/prescriptions/inbox/my"),
  doctorPushPrescription: (data: any) =>
    fetchApi<any>("/prescriptions/doctor-push", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Reservations
  createReservation: (pharmacyId: number, items: Array<{ medicine_id: number; quantity: number }>) =>
    fetchApi<any>("/reservations", {
      method: "POST",
      body: JSON.stringify({ pharmacy_id: pharmacyId, items }),
    }),
  getMyReservations: () => fetchApi<any[]>("/reservations/my"),
  getPharmacyReservations: (pharmacyId: number) => fetchApi<any[]>(`/reservations/pharmacy/${pharmacyId}`),
  updateReservationStatus: (reservationId: number, status: string) =>
    fetchApi<any>(`/reservations/${reservationId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  verifyReservationCode: (code: string) => fetchApi<any>(`/reservations/verify-code/${encodeURIComponent(code)}`),
  fulfillReservationCode: (code: string) =>
    fetchApi<any>(`/reservations/verify-code/${encodeURIComponent(code)}/fulfill`, {
      method: "POST",
    }),
  getReservationWhatsAppLink: (id: number) => fetchApi<any>(`/reservations/${id}/whatsapp-link`),
  getDeliveryQuote: (pharmacyId: number, distanceKm: number) =>
    fetchApi<any>(`/reservations/delivery/quote?pharmacy_id=${pharmacyId}&distance_km=${distanceKm}`, {
      method: "POST",
    }),

  // Notifications
  getMyNotifications: () => fetchApi<any[]>("/notifications/my"),
  markNotificationRead: (id: number) =>
    fetchApi<any>(`/notifications/${id}/read`, {
      method: "PUT",
    }),
  markAllNotificationsRead: () =>
    fetchApi<any>("/notifications/read-all", {
      method: "PUT",
    }),

  // Analytics & Admin
  getAdminStats: () => fetchApi<any>("/analytics/admin-stats"),
  getShortages: () => fetchApi<any[]>("/analytics/shortages"),
  triggerShortageAlert: (medicineId: number, area: string) =>
    fetchApi<any>(`/analytics/alert/trigger?medicine_id=${medicineId}&area=${encodeURIComponent(area)}`, {
      method: "POST",
    }),
  resetDatabase: () =>
    fetchApi<any>("/seed", {
      method: "POST",
    }),
  triggerSeed: () =>
    fetchApi<any>("/seed", {
      method: "POST",
    }),
};
