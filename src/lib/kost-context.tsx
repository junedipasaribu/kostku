"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BuildingInfo,
  RoomData,
  TenantData,
  InvoiceData,
  ExpenseData,
  ComplaintData,
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
  loginAs: (role: "ADMIN" | "TENANT", tenantId?: string) => void;
  logout: () => void;
  updateRoomStatus: (roomId: string, status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE") => void;
  addRoom: (room: Omit<RoomData, "id">) => void;
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

  // Default login session: ADMIN
  const [currentUser, setCurrentUser] = useState<{
    role: "ADMIN" | "TENANT";
    name: string;
    roomNumber?: string;
    tenantId?: string;
  }>({
    role: "ADMIN",
    name: "Junedi Pasaribu (Owner)",
  });

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem("kostku_invoices");
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedComplaints = localStorage.getItem("kostku_complaints");
      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));

      const savedUser = localStorage.getItem("kostku_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch {
      // Ignore fallback
    }
  }, []);

  const loginAs = (role: "ADMIN" | "TENANT", tenantId?: string) => {
    if (role === "ADMIN") {
      const adminUser = { role: "ADMIN" as const, name: "Junedi Pasaribu (Owner)" };
      setCurrentUser(adminUser);
      localStorage.setItem("kostku_user", JSON.stringify(adminUser));
    } else {
      const tenant = tenants.find((t) => t.id === (tenantId || "t101")) || tenants[0];
      const tenantUser = {
        role: "TENANT" as const,
        name: tenant.fullName,
        roomNumber: tenant.roomNumber,
        tenantId: tenant.id,
      };
      setCurrentUser(tenantUser);
      localStorage.setItem("kostku_user", JSON.stringify(tenantUser));
    }
  };

  const logout = () => {
    const defaultUser = { role: "ADMIN" as const, name: "Junedi Pasaribu (Owner)" };
    setCurrentUser(defaultUser);
    localStorage.removeItem("kostku_user");
  };

  const updateRoomStatus = (roomId: string, status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE") => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r))
    );
  };

  const addRoom = (newRoom: Omit<RoomData, "id">) => {
    const id = `r${Date.now().toString().slice(-4)}`;
    setRooms((prev) => [...prev, { ...newRoom, id }]);
  };

  const addTenant = (newTenant: Omit<TenantData, "id">) => {
    const id = `t${Date.now().toString().slice(-4)}`;
    setTenants((prev) => [...prev, { ...newTenant, id }]);
    // Auto update room status to OCCUPIED
    setRooms((prev) =>
      prev.map((r) =>
        r.id === newTenant.roomId ? { ...r, status: "OCCUPIED", tenantName: newTenant.fullName } : r
      )
    );
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
        loginAs,
        logout,
        updateRoomStatus,
        addRoom,
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
