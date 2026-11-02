"use client";

import React, { createContext, useContext, useState, useEffect, startTransition } from "react";
import {
  BuildingInfo,
  RoomData,
  TenantData,
  InvoiceData,
  ExpenseData,
  ComplaintData,
  MaintenanceLog,
  initialBuildingInfo,
  initialRooms,
  initialTenants,
  initialInvoices,
  initialExpenses,
  initialComplaints,
} from "./data";

interface KostContextType {
  building: BuildingInfo;
  rooms: RoomData[];
  tenants: TenantData[];
  invoices: InvoiceData[];
  expenses: ExpenseData[];
  complaints: ComplaintData[];
  currentUser: {
    role: "ADMIN" | "TENANT";
    name: string;
    roomNumber?: string;
    tenantId?: string;
  };
  logout: () => Promise<void>;
  updateRoomStatus: (roomId: string, status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE") => void;
  addRoom: (room: Omit<RoomData, "id">) => void;
  updateRoom: (roomId: string, updatedData: Partial<Omit<RoomData, "id">>) => void;
  deleteRoom: (roomId: string) => void;
  addMaintenanceLog: (roomId: string, log: Omit<MaintenanceLog, "id">) => void;
  addTenant: (tenant: Omit<TenantData, "id">) => void;
  updateInvoiceStatus: (invoiceId: string, status: "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "OVERDUE", paymentProof?: string, method?: string) => void;
  addExpense: (expense: Omit<ExpenseData, "id">) => void;
  updateComplaintStatus: (complaintId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") => void;
  addComplaint: (complaint: Omit<ComplaintData, "id" | "date">) => void;
}

const KostContext = createContext<KostContextType | undefined>(undefined);

function persistRoomCache(rooms: RoomData[]) {
  try {
    const safeRooms = rooms.map((room) => {
      const persistedRoom = { ...room };
      delete persistedRoom.tenantName;
      return persistedRoom;
    });
    localStorage.setItem("kostku_rooms", JSON.stringify(safeRooms));
  } catch {
    // Browser storage is optional; the database remains the source for tenant profiles.
  }
}

async function loadTenantRecords(): Promise<{ tenants: TenantData[]; rooms: RoomData[] } | null> {
  try {
    const legacyTenantsText = localStorage.getItem("kostku_tenants");
    if (legacyTenantsText) {
      const legacyTenants: unknown = JSON.parse(legacyTenantsText);
      const legacyRooms: unknown = JSON.parse(localStorage.getItem("kostku_rooms") ?? "null") ?? initialRooms;
      if (Array.isArray(legacyTenants) && legacyTenants.length > 0) {
        const migration = await fetch("/api/admin/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenants: legacyTenants, rooms: legacyRooms }),
        });
        if (!migration.ok) return null;
      }
      // Remove the legacy browser copy only after the server confirms the import.
      localStorage.removeItem("kostku_tenants");
    }

    const response = await fetch("/api/admin/tenants", { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!Array.isArray(payload?.tenants)) return null;

    const cachedRooms: unknown = JSON.parse(localStorage.getItem("kostku_rooms") ?? "null");
    const resolvedRooms: RoomData[] = Array.isArray(cachedRooms) ? cachedRooms : [...initialRooms];
    const serverTenantRecords = payload.tenants as Array<TenantData & { room: {
      type: RoomData["type"];
      priceMonthly: number;
      floor: number;
      size: string | null;
      status: RoomData["status"];
      facilities: string[];
      images: string[];
    } }>;
    for (const tenant of serverTenantRecords) {
      if (resolvedRooms.some((room) => room.roomNumber === tenant.roomNumber)) continue;
      const serverRoom = tenant.room;
      resolvedRooms.push({
        id: tenant.roomId,
        roomNumber: tenant.roomNumber,
        type: serverRoom.type,
        priceMonthly: serverRoom.priceMonthly,
        floor: serverRoom.floor,
        size: serverRoom.size ?? "",
        status: serverRoom.status,
        facilities: serverRoom.facilities,
        image: serverRoom.images?.[0] ?? "",
      });
    }

    return {
      rooms: resolvedRooms,
      tenants: serverTenantRecords.map((tenant) => ({
        ...tenant,
        roomId: resolvedRooms.find((room) => room.roomNumber === tenant.roomNumber)?.id ?? tenant.roomId,
      })),
    };
  } catch {
    // Keep local data if migration or loading fails; it can be retried on the next admin visit.
    return null;
  }
}

export function KostProvider({ children }: { children: React.ReactNode }) {
  const [building] = useState<BuildingInfo>(initialBuildingInfo);
  const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
  const [tenants, setTenants] = useState<TenantData[]>(initialTenants);
  const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);
  const [complaints, setComplaints] = useState<ComplaintData[]>(initialComplaints);

  const [currentUser, setCurrentUser] = useState<{
    role: "ADMIN" | "TENANT";
    name: string;
    roomNumber?: string;
    tenantId?: string;
  }>({
    role: "TENANT",
    name: "",
  });

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem("kostku_rooms");
      const savedTenants = localStorage.getItem("kostku_tenants");
      const savedInvoices = localStorage.getItem("kostku_invoices");
      const savedExpenses = localStorage.getItem("kostku_expenses");
      const savedComplaints = localStorage.getItem("kostku_complaints");
      const storedRooms = savedRooms ? JSON.parse(savedRooms) : null;
      const storedTenants = savedTenants ? JSON.parse(savedTenants) : null;
      const storedInvoices = savedInvoices ? JSON.parse(savedInvoices) : null;
      const storedExpenses = savedExpenses ? JSON.parse(savedExpenses) : null;
      const storedComplaints = savedComplaints ? JSON.parse(savedComplaints) : null;

      startTransition(() => {
        if (storedRooms) setRooms(storedRooms);
        if (storedTenants) setTenants(storedTenants);
        if (storedInvoices) setInvoices(storedInvoices);
        if (storedExpenses) setExpenses(storedExpenses);
        if (storedComplaints) setComplaints(storedComplaints);
      });

    } catch {
      // Ignore fallback
    }

    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.user) return;
        setCurrentUser({
          role: payload.user.role === "TENANT" ? "TENANT" : "ADMIN",
          name: payload.user.name,
          tenantId: payload.user.tenantId ?? undefined,
        });
        if (payload.user.role !== "TENANT") {
          void loadTenantRecords().then((data) => {
            if (!data) return;
            setRooms(data.rooms);
            setTenants(data.tenants);
            persistRoomCache(data.rooms);
            localStorage.removeItem("kostku_tenants");
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser({ role: "TENANT", name: "" });
  };

  const updateRoomStatus = (roomId: string, status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE") => {
    setRooms((prev) => {
      const updated = prev.map((r) => (r.id === roomId ? { ...r, status } : r));
      persistRoomCache(updated);
      return updated;
    });
  };

  const addRoom = (newRoom: Omit<RoomData, "id">) => {
    const id = `r${Date.now().toString().slice(-4)}`;
    setRooms((prev) => {
      const updated = [...prev, { ...newRoom, id }];
      persistRoomCache(updated);
      return updated;
    });
  };

  const updateRoom = (roomId: string, updatedData: Partial<Omit<RoomData, "id">>) => {
    setRooms((prev) => {
      const updated = prev.map((r) => (r.id === roomId ? { ...r, ...updatedData } : r));
      persistRoomCache(updated);
      return updated;
    });
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== roomId);
      persistRoomCache(updated);
      return updated;
    });
  };

  const addMaintenanceLog = (roomId: string, log: Omit<MaintenanceLog, "id">) => {
    const id = `mlog-${Date.now().toString().slice(-6)}`;
    setRooms((prev) => {
      const updated = prev.map((r) =>
        r.id === roomId
          ? { ...r, maintenanceLog: [{ ...log, id }, ...(r.maintenanceLog || [])] }
          : r
      );
      persistRoomCache(updated);
      return updated;
    });
  };

  const addTenant = async (newTenant: Omit<TenantData, "id">) => {
    const room = rooms.find((item) => item.id === newTenant.roomId);
    if (!room) throw new Error("Data kamar tidak ditemukan");
    const response = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenants: [{ ...newTenant, roomNumber: room.roomNumber }],
        rooms: [room],
      }),
    });
    if (!response.ok) throw new Error("Data penghuni belum dapat disimpan");
    const payload = await response.json();
    const tenantId = payload.legacyIds?.[0];
    if (typeof tenantId !== "string") throw new Error("Server tidak mengembalikan ID penghuni");
    const savedTenant = { ...newTenant, id: tenantId, roomNumber: room.roomNumber };
    setTenants((prev) => [...prev, savedTenant]);
    setRooms((prev) => prev.map((item) => item.id === room.id ? { ...item, status: "OCCUPIED", tenantName: newTenant.fullName } : item));
  };

  const updateInvoiceStatus = (
    invoiceId: string,
    status: "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "OVERDUE",
    paymentProof?: string,
    method?: string
  ) => {
    setInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paymentProof: paymentProof || inv.paymentProof,
              paymentMethod: method || inv.paymentMethod || "Transfer BCA",
              paidAt: status === "PAID" ? new Date().toLocaleString("id-ID") : inv.paidAt,
            }
          : inv
      );
      try {
        localStorage.setItem("kostku_invoices", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addExpense = (newExp: Omit<ExpenseData, "id">) => {
    const id = `exp-${Date.now().toString().slice(-4)}`;
    setExpenses((prev) => [ { ...newExp, id }, ...prev ]);
  };

  const updateComplaintStatus = (
    complaintId: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => {
    setComplaints((prev) => {
      const updated = prev.map((c) =>
        c.id === complaintId ? { ...c, status } : c
      );
      try {
        localStorage.setItem("kostku_complaints", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addComplaint = (newComp: Omit<ComplaintData, "id" | "date">) => {
    const id = `comp-${Date.now().toString().slice(-4)}`;
    const date = new Date().toISOString().split("T")[0];
    setComplaints((prev) => {
      const updated = [ { ...newComp, id, date }, ...prev ];
      try {
        localStorage.setItem("kostku_complaints", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <KostContext.Provider
      value={{
        building,
        rooms,
        tenants,
        invoices,
        expenses,
        complaints,
        currentUser,
        logout,
        updateRoomStatus,
        addRoom,
        updateRoom,
        deleteRoom,
        addMaintenanceLog,
        addTenant,
        updateInvoiceStatus,
        addExpense,
        updateComplaintStatus,
        addComplaint,
      }}
    >
      {children}
    </KostContext.Provider>
  );
}

export function useKost() {
  const context = useContext(KostContext);
  if (!context) {
    throw new Error("useKost must be used within a KostProvider");
  }
  return context;
}
