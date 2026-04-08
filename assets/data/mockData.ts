// assets/data/mockData.ts
export type HistorialItem = {
  id: number;
  nombreServicio: string;
  contraparte: string;
  rol: "cliente" | "proveedor";
  fecha: string;
  hora: string;
  estado: "completado" | "cancelado" | "pendiente";
  foto?: string;
  monto?: number;
};

export type MockService = {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio?: number;
  duracion?: number;
  rating?: number;
};

export type MockUser = {
  id: number;
  nombre: string;
  apellido_paterno: string;
  email: string;
  telefono: string;
  rol: "Profesional" | "Cliente";
  categoria?: string;
  foto?: string;
  ubicacion?: string;
  lugarAtencion?: string[] | string;
  rating?: number;
  cantidadOpiniones?: number;
  destacado?: boolean;
  portafolio?: string[];
  servicios?: MockService[];
  favoritos?: number[]; // ids de servicios
  historial?: HistorialItem[];
};

// ========================
// PROVEEDORA MANICURISTA
// ========================
const valentina: MockUser = {
  id: 1,
  nombre: "Valentina",
  apellido_paterno: "Torres",
  email: "valen.nails@example.com",
  telefono: "+56 9 8723 1122",
  rol: "Profesional",
  categoria: "Manicure y uñas press-on",
  foto: "https://randomuser.me/api/portraits/women/45.jpg",
  ubicacion: "Providencia, Santiago",
  lugarAtencion: ["A domicilio", "En su estudio"],
  rating: 4.8,
  cantidadOpiniones: 37,
  destacado: true,
  portafolio: [
    "https://images.unsplash.com/photo-1588159343745-cb39b74b3c7f",
    "https://images.unsplash.com/photo-1604654894613-9a151b9fbb3f",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a",
  ],
  servicios: [
    {
      id: 101,
      nombre: "Esmaltado semipermanente clásico",
      descripcion: "Incluye limado, cutículas y esmaltado con color a elección.",
      imagen: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      precio: 15000,
      duracion: 60,
      rating: 4.7,
    },
    {
      id: 102,
      nombre: "Soft Gel con diseño kawaii",
      descripcion: "Uñas soft gel con diseño personalizado (k-pop, anime, glitter).",
      imagen: "https://images.unsplash.com/photo-1585128792020-803d29415281",
      precio: 25000,
      duracion: 90,
      rating: 4.9,
    },
  ],
  favoritos: [201], // le gusta un servicio del gasfíter
  historial: [
    {
      id: 1,
      nombreServicio: "Revisión de fuga en baño",
      contraparte: "Tomás Fuentes",
      rol: "cliente",
      fecha: "2025-10-15",
      hora: "16:00",
      estado: "completado",
      monto: 35000,
      foto: "https://randomuser.me/api/portraits/men/52.jpg",
    },
  ],
};

// ========================
// PROVEEDOR GASFÍTER
// ========================
const tomas: MockUser = {
  id: 2,
  nombre: "Tomás",
  apellido_paterno: "Fuentes",
  email: "tomas.gasfit@example.com",
  telefono: "+56 9 9876 4410",
  rol: "Profesional",
  categoria: "Gasfitería y mantenciones",
  foto: "https://randomuser.me/api/portraits/men/60.jpg",
  ubicacion: "La Florida, Santiago",
  lugarAtencion: ["A domicilio"],
  rating: 4.9,
  cantidadOpiniones: 24,
  destacado: false,
  portafolio: [
    "https://images.unsplash.com/photo-1563251347-2e24cba4d1c9",
    "https://images.unsplash.com/photo-1562967914-608f82629710",
  ],
  servicios: [
    {
      id: 201,
      nombre: "Reparación de filtraciones",
      descripcion: "Detección y reparación de filtraciones en baño o cocina.",
      imagen: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
      precio: 35000,
      duracion: 90,
      rating: 4.8,
    },
    {
      id: 202,
      nombre: "Instalación de calefón",
      descripcion: "Instalación y prueba de calefón a gas según normativa.",
      imagen: "https://images.unsplash.com/photo-1604079628040-94301bb21b11",
      precio: 45000,
      duracion: 120,
      rating: 4.9,
    },
  ],
  favoritos: [101],
  historial: [
    {
      id: 2,
      nombreServicio: "Soft Gel con diseño kawaii",
      contraparte: "Valentina Torres",
      rol: "cliente",
      fecha: "2025-10-20",
      hora: "11:00",
      estado: "completado",
      monto: 25000,
      foto: "https://randomuser.me/api/portraits/women/45.jpg",
    },
  ],
};

// ========================
// CLIENTA SOLO CLIENTE
// ========================
const camila: MockUser = {
  id: 3,
  nombre: "Camila",
  apellido_paterno: "Herrera",
  email: "camila.herrera@example.com",
  telefono: "+56 9 8811 3344",
  rol: "Cliente",
  foto: "https://randomuser.me/api/portraits/women/70.jpg",
  ubicacion: "Las Condes, Santiago",
  favoritos: [101, 201, 202],
  historial: [
    {
      id: 3,
      nombreServicio: "Soft Gel con diseño kawaii",
      contraparte: "Valentina Torres",
      rol: "cliente",
      fecha: "2025-11-05",
      hora: "10:30",
      estado: "completado",
      monto: 25000,
      foto: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      id: 4,
      nombreServicio: "Reparación de filtraciones",
      contraparte: "Tomás Fuentes",
      rol: "cliente",
      fecha: "2025-11-03",
      hora: "18:00",
      estado: "completado",
      monto: 35000,
      foto: "https://randomuser.me/api/portraits/men/60.jpg",
    },
  ],
};

// ========================
// EXPORTS
// ========================
export const mockUsers: MockUser[] = [valentina, tomas, camila];

export const mockProviders = mockUsers.filter((u) => u.rol === "Profesional");

export const mockClientOnly = camila;

// Servicios planos por si necesitas listarlos en Search / Home
export const mockServices: MockService[] = [
  ...(valentina.servicios || []),
  ...(tomas.servicios || []),
];
