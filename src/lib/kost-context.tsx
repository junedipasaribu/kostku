"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { BuildingInfo, RoomData, TenantData, InvoiceData, ExpenseData, ComplaintData, MaintenanceLog } from "./data";

interface KostContextType {
  building: BuildingInfo;
  rooms: RoomData[];
  tenants: TenantData[];
  invoices: InvoiceData[];
  expenses: ExpenseData[];
  complaints: ComplaintData[];
  currentUser: { role: "ADMIN" | "TENANT"; name: string; roomNumber?: string; tenantId?: string };
  logout: () => Promise<void>;
  updateBuilding: (value: BuildingInfo) => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomData["status"]) => Promise<void>;
  addRoom: (room: Omit<RoomData, "id">) => Promise<void>;
  updateRoom: (roomId: string, updatedData: Partial<Omit<RoomData, "id">>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  addMaintenanceLog: (roomId: string, log: Omit<MaintenanceLog, "id">) => Promise<void>;
  addTenant: (tenant: Omit<TenantData, "id">) => Promise<void>;
  addInvoice: (tenantId: string, periodMonth: number, periodYear: number, dueDate: string) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceData["status"], paymentProof?: string, method?: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseData, "id">) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: ComplaintData["status"]) => Promise<void>;
  addComplaint: (complaint: Pick<ComplaintData, "title" | "description">) => Promise<void>;
  isLoading: boolean;
}

const emptyBuilding: BuildingInfo = { name: "", tagline: "", address: "", ownerName: "", ownerPhone: "", bankName: "", bankAccount: "", bankHolder: "", qrisUrl: "", rules: [], sharedFacilities: [] };
const KostContext = createContext<KostContextType | undefined>(undefined);

async function requestOperation(action: string, data: Record<string, unknown>) {
  const response = await fetch("/api/admin/operations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Perubahan tidak dapat disimpan");
  return payload as { id?: string; success: boolean };
}

async function loadTenantRecords(): Promise<TenantData[] | null> {
  try {
    const legacyTenantsText = localStorage.getItem("kostku_tenants");
    if (legacyTenantsText) {
      const legacyTenants: unknown = JSON.parse(legacyTenantsText);
      const legacyRooms: unknown = JSON.parse(localStorage.getItem("kostku_rooms") ?? "null") ?? [];
      if (Array.isArray(legacyTenants) && legacyTenants.length > 0) {
        const migration = await fetch("/api/admin/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenants: legacyTenants, rooms: legacyRooms }),
        });
        if (!migration.ok) return null;
      }
      localStorage.removeItem("kostku_tenants");
    }
    const response = await fetch("/api/admin/tenants", { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    return Array.isArray(payload.tenants) ? payload.tenants as TenantData[] : null;
  } catch {
    return null;
  }
}

export function KostProvider({ children }: { children: React.ReactNode }) {
  const [building, setBuilding] = useState<BuildingInfo>(emptyBuilding);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<KostContextType["currentUser"]>({ role: "TENANT", name: "" });

  const refreshOperations = async () => {
    const response = await fetch("/api/admin/operations", { cache: "no-store" });
    if (!response.ok) throw new Error("Data operasional belum dapat dimuat");
    const payload = await response.json();
    setRooms(Array.isArray(payload.rooms) ? payload.rooms : []);
    setInvoices(Array.isArray(payload.invoices) ? payload.invoices : []);
    setExpenses(Array.isArray(payload.expenses) ? payload.expenses : []);
    setComplaints(Array.isArray(payload.complaints) ? payload.complaints : []);
    setBuilding(payload.building ?? emptyBuilding);
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        if (!sessionResponse.ok) return;
        const sessionPayload = await sessionResponse.json();
        const user = sessionPayload.user;
        if (!user || !active) return;
        setCurrentUser({ role: user.role === "TENANT" ? "TENANT" : "ADMIN", name: user.name, tenantId: user.tenantId ?? undefined });
        if (user.role === "OWNER" || user.role === "ADMIN") {
          const serverTenants = await loadTenantRecords();
          if (serverTenants && active) setTenants(serverTenants);
          await refreshOperations();
        }
      } catch {
        // Keep empty state and let the user retry after the connection is restored.
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const reportError = (error: unknown) => {
    if (typeof window !== "undefined") window.alert(error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser({ role: "TENANT", name: "" });
  };

  const updateBuilding = async (value: BuildingInfo) => {
    try { await requestOperation("building.update", value as unknown as Record<string, unknown>); setBuilding(value); }
    catch (error) { reportError(error); throw error; }
  };

  const updateRoomStatus = async (roomId: string, status: RoomData["status"]) => {
    try {
      await requestOperation("room.status", { id: roomId, status });
      setRooms((prev) => prev.map((room) => room.id === roomId ? { ...room, status } : room));
    } catch (error) { reportError(error); }
  };

  const addRoom = async (room: Omit<RoomData, "id">) => {
    try {
      const result = await requestOperation("room.create", room as unknown as Record<string, unknown>);
      setRooms((prev) => [...prev, { ...room, id: result.id ?? "" }]);
    } catch (error) { reportError(error); throw error; }
  };

  const updateRoom = async (roomId: string, updatedData: Partial<Omit<RoomData, "id">>) => {
    const current = rooms.find((room) => room.id === roomId);
    if (!current) return;
    try {
      await requestOperation("room.update", { ...current, ...updatedData, id: roomId });
      setRooms((prev) => prev.map((room) => room.id === roomId ? { ...room, ...updatedData } : room));
    } catch (error) { reportError(error); throw error; }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await requestOperation("room.delete", { id: roomId });
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (error) { reportError(error); throw error; }
  };

  const addMaintenanceLog = async (roomId: string, log: Omit<MaintenanceLog, "id">) => {
    try {
      const result = await requestOperation("maintenance.create", { roomId, ...log });
      setRooms((prev) => prev.map((room) => room.id === roomId ? { ...room, maintenanceLog: [{ ...log, id: result.id ?? "" }, ...(room.maintenanceLog ?? [])] } : room));
    } catch (error) { reportError(error); throw error; }
  };

  const addTenant = async (newTenant: Omit<TenantData, "id">) => {
    const room = rooms.find((item) => item.id === newTenant.roomId);
    if (!room) throw new Error("Data kamar tidak ditemukan");
    try {
      const response = await fetch("/api/admin/tenants", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenants: [{ ...newTenant, roomNumber: room.roomNumber }], rooms: [room] }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Data penghuni belum dapat disimpan");
      const tenantId = payload.legacyIds?.[0];
      if (typeof tenantId !== "string") throw new Error("Server tidak mengembalikan ID penghuni");
      setTenants((prev) => [...prev, { ...newTenant, id: tenantId, roomNumber: room.roomNumber }]);
      setRooms((prev) => prev.map((item) => item.id === room.id ? { ...item, status: "OCCUPIED", tenantName: newTenant.fullName } : item));
    } catch (error) { reportError(error); throw error; }
  };

  const addInvoice = async (tenantId: string, periodMonth: number, periodYear: number, dueDate: string) => {
    try { await requestOperation("invoice.create", { tenantId, periodMonth, periodYear, dueDate }); await refreshOperations(); }
    catch (error) { reportError(error); throw error; }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: InvoiceData["status"], paymentProof?: string, method?: string) => {
    try {
      await requestOperation("invoice.status", { id: invoiceId, status, paymentProof, method });
      setInvoices((prev) => prev.map((invoice) => invoice.id === invoiceId ? { ...invoice, status, paidAt: status === "PAID" ? new Date().toISOString() : undefined, paymentProof: paymentProof ?? invoice.paymentProof, paymentMethod: method ?? invoice.paymentMethod } : invoice));
    } catch (error) { reportError(error); }
  };

  const addExpense = async (newExpense: Omit<ExpenseData, "id">) => {
    try {
      const result = await requestOperation("expense.create", newExpense as unknown as Record<string, unknown>);
      setExpenses((prev) => [{ ...newExpense, id: result.id ?? "" }, ...prev]);
    } catch (error) { reportError(error); throw error; }
  };

  const updateComplaintStatus = async (complaintId: string, status: ComplaintData["status"]) => {
    try {
      await requestOperation("complaint.status", { id: complaintId, status });
      setComplaints((prev) => prev.map((complaint) => complaint.id === complaintId ? { ...complaint, status } : complaint));
    } catch (error) { reportError(error); }
  };

  const addComplaint = async (newComplaint: Pick<ComplaintData, "title" | "description">) => {
    try {
      await requestOperation("complaint.create", newComplaint as unknown as Record<string, unknown>);
    } catch (error) { reportError(error); throw error; }
  };

  return (
    <KostContext.Provider value={{ building, rooms, tenants, invoices, expenses, complaints, currentUser, isLoading, logout, updateBuilding, updateRoomStatus, addRoom, updateRoom, deleteRoom, addMaintenanceLog, addTenant, addInvoice, updateInvoiceStatus, addExpense, updateComplaintStatus, addComplaint }}>
      {children}
    </KostContext.Provider>
  );
}

export function useKost() {
  const context = useContext(KostContext);
  if (!context) throw new Error("useKost must be used within a KostProvider");
  return context;
}
