export interface BuildingInfo {
  name: string;
  tagline: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  qrisUrl: string;
  rules: string[];
  sharedFacilities: string[];
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  cost?: number;
  technician?: string;
}

export interface RoomData {
  id: string;
  roomNumber: string;
  type: "Executive" | "Deluxe" | "Superior" | "Standard";
  priceMonthly: number;
  floor: number;
  size: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  facilities: string[];
  tenantName?: string;
  image: string;
  maintenanceLog?: MaintenanceLog[];
}

export interface TenantData {
  id: string;
  roomId: string;
  roomNumber: string;
  fullName: string;
  phone: string;
  idCardNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  startDate: string;
  endDate?: string;
  depositAmount: number;
  depositStatus: "HELD" | "REFUNDED" | "DEDUCTED";
  status: "ACTIVE" | "ENDED";
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  roomNumber: string;
  periodMonth: string;
  periodYear: number;
  amount: number;
  dueDate: string;
  status: "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "OVERDUE";
  paymentProof?: string;
  paymentMethod?: string;
  paidAt?: string;
}

export interface ExpenseData {
  id: string;
  category: "Listrik" | "Air/PDAM" | "WiFi" | "Kebersihan & Sampah" | "Maintenance & Perbaikan";
  description: string;
  amount: number;
  date: string;
}

export interface ComplaintData {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  date: string;
}

// Business data is loaded from PostgreSQL. These empty values are only initial UI state.
export const initialBuildingInfo: BuildingInfo = {
  name: "",
  tagline: "",
  address: "",
  ownerName: "",
  ownerPhone: "",
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  qrisUrl: "",
  rules: [],
  sharedFacilities: [],
};

export const initialRooms: RoomData[] = [];
export const initialTenants: TenantData[] = [];
export const initialInvoices: InvoiceData[] = [];
export const initialExpenses: ExpenseData[] = [];
export const initialComplaints: ComplaintData[] = [];
