"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
      if (savedRooms) setRooms(JSON.parse(savedRooms));

      const savedTenants = localStorage.getItem("kostku_tenants");
      if (savedTenants) setTenants(JSON.parse(savedTenants));

      const savedInvoices = localStorage.getItem("kostku_invoices");
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedExpenses = localStorage.getItem("kostku_expenses");
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedComplaints = localStorage.getItem("kostku_complaints");
      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));

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
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addRoom = (newRoom: Omit<RoomData, "id">) => {
    const id = `r${Date.now().toString().slice(-4)}`;
    setRooms((prev) => {
      const updated = [...prev, { ...newRoom, id }];
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateRoom = (roomId: string, updatedData: Partial<Omit<RoomData, "id">>) => {
    setRooms((prev) => {
      const updated = prev.map((r) => (r.id === roomId ? { ...r, ...updatedData } : r));
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== roomId);
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
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
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addTenant = (newTenant: Omit<TenantData, "id">) => {
    const id = `t${Date.now().toString().slice(-4)}`;
    setTenants((prev) => {
      const updated = [...prev, { ...newTenant, id }];
      try {
        localStorage.setItem("kostku_tenants", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    // Auto update room status to OCCUPIED
    setRooms((prev) => {
      const updated = prev.map((r) =>
        r.id === newTenant.roomId ? { ...r, status: "OCCUPIED" as const, tenantName: newTenant.fullName } : r
      );
      try {
        localStorage.setItem("kostku_rooms", JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
