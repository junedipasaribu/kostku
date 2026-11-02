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

export const initialBuildingInfo: BuildingInfo = {
  name: "Kostku Residence",
  tagline: "Hunian Kost Eksklusif, Tenang & Modern",
  address: "Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan",
  ownerName: "Junedi Pasaribu",
  ownerPhone: "6281234567890",
  bankName: "Bank Central Asia (BCA)",
  bankAccount: "8830-1234-56",
  bankHolder: "JUNEDI PASARIBU",
  qrisUrl: "https://images.unsplash.com/photo-1595079672139-545c025076cf?auto=format&fit=crop&w=400&q=80",
};

export const initialRooms: RoomData[] = [
  {
    id: "r101",
    roomNumber: "101",
    type: "Deluxe",
    priceMonthly: 1950000,
    floor: 1,
    size: "3.5 x 4 m",
    status: "OCCUPIED",
    tenantName: "Penghuni Contoh 1",
    facilities: ["AC Inverter", "Kamar Mandi Dalam", "Water Heater", "WiFi 100 Mbps", "Kasur Single 120x200", "Meja Belajar"],
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r102",
    roomNumber: "102",
    type: "Deluxe",
    priceMonthly: 1950000,
    floor: 1,
    size: "3.5 x 4 m",
    status: "OCCUPIED",
    tenantName: "Penghuni Contoh 2",
    facilities: ["AC Inverter", "Kamar Mandi Dalam", "Water Heater", "WiFi 100 Mbps", "Kasur Single 120x200", "Lemari 2 Pintu"],
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r103",
    roomNumber: "103",
    type: "Standard",
    priceMonthly: 1500000,
    floor: 1,
    size: "3 x 3.5 m",
    status: "AVAILABLE",
    facilities: ["AC", "Kamar Mandi Luar (Bersih)", "WiFi 100 Mbps", "Kasur Single", "Meja"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r104",
    roomNumber: "104",
    type: "Standard",
    priceMonthly: 1500000,
    floor: 1,
    size: "3 x 3.5 m",
    status: "MAINTENANCE",
    facilities: ["AC", "Kamar Mandi Luar", "WiFi 100 Mbps", "Kasur Single"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    maintenanceLog: [
      {
        id: "mlog-01",
        date: "2026-09-03",
        description: "Servis rutin & cuci AC — pipa pembuangan tersumbat, dibersihkan.",
        cost: 350000,
        technician: "Pak Wahyu (Teknisi AC)",
      },
    ],
  },
  {
    id: "r201",
    roomNumber: "201",
    type: "Executive",
    priceMonthly: 2500000,
    floor: 2,
    size: "4 x 4.5 m",
    status: "OCCUPIED",
    tenantName: "Penghuni Contoh 3",
    facilities: ["AC Daikin Inverter", "Smart TV 32 inch", "Kamar Mandi Dalam", "Water Heater", "Kulkas Pribadi", "Balkon", "Springbed Queen 160x200"],
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r202",
    roomNumber: "202",
    type: "Executive",
    priceMonthly: 2500000,
    floor: 2,
    size: "4 x 4.5 m",
    status: "AVAILABLE",
    facilities: ["AC Daikin Inverter", "Smart TV 32 inch", "Kamar Mandi Dalam", "Water Heater", "Kulkas Pribadi", "Balkon"],
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r203",
    roomNumber: "203",
    type: "Superior",
    priceMonthly: 1800000,
    floor: 2,
    size: "3.5 x 3.8 m",
    status: "OCCUPIED",
    tenantName: "Penghuni Contoh 4",
    facilities: ["AC", "Kamar Mandi Dalam", "Shower", "WiFi 100 Mbps", "Kasur Single 120x200"],
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r204",
    roomNumber: "204",
    type: "Superior",
    priceMonthly: 1800000,
    floor: 2,
    size: "3.5 x 3.8 m",
    status: "AVAILABLE",
    facilities: ["AC", "Kamar Mandi Dalam", "Shower", "WiFi 100 Mbps", "Kasur Single 120x200"],
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  },
];

export const initialTenants: TenantData[] = [
  {
    id: "t101",
    roomId: "r101",
    roomNumber: "101",
    fullName: "Penghuni Contoh 1",
    phone: "628000000001",
    idCardNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    startDate: "2026-01-10",
    endDate: "2026-09-14", // Hampir habis — 4 hari lagi (trigger alert)
    depositAmount: 1000000,
    depositStatus: "HELD",
    status: "ACTIVE",
  },
  {
    id: "t102",
    roomId: "r102",
    roomNumber: "102",
    fullName: "Penghuni Contoh 2",
    phone: "628000000002",
    idCardNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    startDate: "2026-02-01",
    endDate: "2027-02-01",
    depositAmount: 1000000,
    depositStatus: "HELD",
    status: "ACTIVE",
  },
  {
    id: "t201",
    roomId: "r201",
    roomNumber: "201",
    fullName: "Penghuni Contoh 3",
    phone: "628000000003",
    idCardNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    startDate: "2025-11-15",
    endDate: "2026-11-15",
    depositAmount: 1500000,
    depositStatus: "HELD",
    status: "ACTIVE",
  },
  {
    id: "t203",
    roomId: "r203",
    roomNumber: "203",
    fullName: "Penghuni Contoh 4",
    phone: "628000000004",
    idCardNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    startDate: "2025-12-01",
    endDate: "2026-12-01",
    depositAmount: 1000000,
    depositStatus: "HELD",
    status: "ACTIVE",
  },
];

export const initialInvoices: InvoiceData[] = [
  {
    id: "inv-2026-09-101",
    invoiceNumber: "INV/KOST/202609/101",
    tenantId: "t101",
    tenantName: "Penghuni Contoh 1",
    tenantPhone: "628000000001",
    roomNumber: "101",
    periodMonth: "September",
    periodYear: 2026,
    amount: 1950000,
    dueDate: "2026-09-10",
    status: "UNPAID",
  },
  {
    id: "inv-2026-09-102",
    invoiceNumber: "INV/KOST/202609/102",
    tenantId: "t102",
    tenantName: "Penghuni Contoh 2",
    tenantPhone: "628000000002",
    roomNumber: "102",
    periodMonth: "September",
    periodYear: 2026,
    amount: 1950000,
    dueDate: "2026-09-05",
    status: "PENDING_VERIFICATION",
    paymentProof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    paymentMethod: "Transfer BCA",
  },
  {
    id: "inv-2026-09-201",
    invoiceNumber: "INV/KOST/202609/201",
    tenantId: "t201",
    tenantName: "Penghuni Contoh 3",
    tenantPhone: "628000000003",
    roomNumber: "201",
    periodMonth: "September",
    periodYear: 2026,
    amount: 2500000,
    dueDate: "2026-09-15",
    status: "PAID",
    paymentProof: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    paymentMethod: "QRIS",
    paidAt: "2026-09-01 14:20",
  },
  {
    id: "inv-2026-09-203",
    invoiceNumber: "INV/KOST/202609/203",
    tenantId: "t203",
    tenantName: "Penghuni Contoh 4",
    tenantPhone: "628000000004",
    roomNumber: "203",
    periodMonth: "September",
    periodYear: 2026,
    amount: 1800000,
    dueDate: "2026-09-05",
    status: "UNPAID",
  },
];

export const initialExpenses: ExpenseData[] = [
  {
    id: "exp-01",
    category: "Listrik",
    description: "Token Listrik Induk Gedung & Pompa Air",
    amount: 1250000,
    date: "2026-09-01",
  },
  {
    id: "exp-02",
    category: "Air/PDAM",
    description: "Tagihan PDAM Bulan Agustus",
    amount: 450000,
    date: "2026-09-01",
  },
  {
    id: "exp-03",
    category: "WiFi",
    description: "Paket Internet Biznet Dedicated 100 Mbps",
    amount: 650000,
    date: "2026-09-02",
  },
  {
    id: "exp-04",
    category: "Kebersihan & Sampah",
    description: "Iuran Kebersihan RT & Pengangkutan Sampah Harian",
    amount: 300000,
    date: "2026-09-02",
  },
  {
    id: "exp-05",
    category: "Maintenance & Perbaikan",
    description: "Servis Rutin & Cuci AC Kamar 104",
    amount: 350000,
    date: "2026-09-03",
  },
];

export const initialComplaints: ComplaintData[] = [
  {
    id: "comp-01",
    tenantId: "t104",
    tenantName: "Penghuni Kamar 104",
    roomNumber: "104",
    title: "AC bocor menetes ke lantai",
    description: "Pipa pembuangan air AC sepertinya tersumbat, air mulai menetes ke lantai kamar.",
    status: "IN_PROGRESS",
    date: "2026-09-02",
  },
  {
    id: "comp-02",
    tenantId: "t201",
    tenantName: "Penghuni Contoh 3",
    roomNumber: "201",
    title: "Kran shower air panas kurang kencang",
    description: "Aliran air panas dari water heater agak pelan dibanding air dingin biasa.",
    status: "OPEN",
    date: "2026-09-03",
  },
  {
    id: "comp-03",
    tenantId: "t101",
    tenantName: "Penghuni Contoh 1",
    roomNumber: "101",
    title: "Lampu balkon mati",
    description: "Bohlam lampu di balkon luar kamar 101 mati sejak kemarin malam.",
    status: "RESOLVED",
    date: "2026-08-30",
  },
];
