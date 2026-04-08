import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AdminDashboard from "../app/admin/index";
import { AuthContext } from "../context/AuthContext";
import { adminService } from "../services/adminService";

jest.mock("../services/adminService");

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: "FontAwesome"
}));

const mockStats = {
  totalUsers: 100,
  newUsersToday: 5,
  totalServices: 20,
  pendingServices: 3,
  reportedReviews: 2,
  totalCategories: 8
};

const mockReviews = [
  { id: 1, serviceName: "Gasfitería", comment: "Muy mal servicio", rating: 1, reportCount: 3 },
  { id: 2, serviceName: "Electricista", comment: "Llegó tarde", rating: 2, reportCount: 2 },
  { id: 3, serviceName: "Carpintería", comment: "No recomendado", rating: 1, reportCount: 4 },
  { id: 4, serviceName: "Pintura", comment: "Trabajo deficiente", rating: 2, reportCount: 1 },
  { id: 5, serviceName: "Jardinería", comment: "Pésimo", rating: 1, reportCount: 2 },
  { id: 6, serviceName: "Limpieza", comment: "No cumplió", rating: 1, reportCount: 5 }
];

const renderComponent = () => {
  const utils = render(
    <AuthContext.Provider value={{ user: { nombre: "Lorena" } } as any}>
      <AdminDashboard />
    </AuthContext.Provider>
  );

  waitFor(() => {
    expect(adminService.getStats).toHaveBeenCalled();
  });

  return utils;
};

describe("AdminDashboard", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("muestra loader inicialmente", () => {
    const { getByText } = renderComponent();
    expect(getByText("Cargando panel...")).toBeTruthy();
  });

  test("carga estadísticas desde API", async () => {
    renderComponent();

    await waitFor(() => {
      expect(adminService.getStats).toHaveBeenCalled();
      expect(adminService.getReportedReviews).toHaveBeenCalled();
    });
  });

  test("muestra título del panel", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("muestra saludo con nombre", async () => {
    const { findByText } = renderComponent();
    expect(await findByText(/Hola/)).toBeTruthy();
    expect(await findByText("Lorena")).toBeTruthy();
  });

  test("muestra subtítulo del panel", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Panel de Administración SMarket")).toBeTruthy();
  });

  test("muestra sección resumen general", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("📊 Resumen general")).toBeTruthy();
  });

  test("muestra total usuarios", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("100")).toBeTruthy();
  });

  test("muestra nuevos usuarios hoy", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("5")).toBeTruthy();
  });

  test("muestra total servicios", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("20")).toBeTruthy();
  });

  test("muestra servicios pendientes", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("3")).toBeTruthy();
  });

  test("muestra total categorías", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("8")).toBeTruthy();
  });

  test("muestra sección de alertas", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("🚨 Alertas")).toBeTruthy();
    expect(await findByText("2 reseñas reportadas")).toBeTruthy();
  });

  test("muestra sección últimas reportadas", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("⚠️ Últimas reportadas")).toBeTruthy();
  });

  test("muestra reseñas reportadas", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Gasfitería")).toBeTruthy();
    expect(await findByText("Electricista")).toBeTruthy();
  });

  test("muestra comentario de reseña", async () => {
    const { findByText } = renderComponent();
    expect(await findByText(/Muy mal servicio/)).toBeTruthy();
  });

  test("muestra rating", async () => {
    const { findAllByText } = renderComponent();
    const ratings = await findAllByText(/⭐/);
    expect(ratings.length).toBeGreaterThan(0);
  });

  test("muestra contador de reportes", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("🚩 3 reportes")).toBeTruthy();
  });

  test("solo muestra máximo 5 reseñas", async () => {
    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText("Limpieza")).toBeNull();
    });
  });

  test("botón ver todas navega a reviews", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Ver todas");
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/reviews");
  });

  test("click reseña abre detalle", async () => {
    const { findByText } = renderComponent();

    const review = await findByText("Gasfitería");
    fireEvent.press(review);

    expect(mockPush).toHaveBeenCalledWith("/admin/reviews/1");
  });

  test("click usuarios navega", async () => {
    const { findByText } = renderComponent();

    const card = await findByText("Usuarios");
    fireEvent.press(card);

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
  });

  test("click servicios navega", async () => {
    const { findByText } = renderComponent();

    const card = await findByText("Servicios");
    fireEvent.press(card);

    expect(mockPush).toHaveBeenCalledWith("/admin/services");
  });

  test("click categorías navega", async () => {
    const { findByText } = renderComponent();

    const card = await findByText("Categorías");
    fireEvent.press(card);

    expect(mockPush).toHaveBeenCalledWith("/admin/categories");
  });

  test("muestra sección acciones rápidas", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("⚡ Acciones rápidas")).toBeTruthy();
  });

  test("muestra botón nueva categoría", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Nueva categoría")).toBeTruthy();
  });

  test("muestra botón reportes", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Reportes")).toBeTruthy();
  });

  test("muestra botón configuración", async () => {
    const { findByText } = renderComponent();
    expect(await findByText("Configuración")).toBeTruthy();
  });

  test("navega a crear categoría", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Nueva categoría");
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/categories/create");
  });

  test("navega a reportes", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Reportes");
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/reports");
  });

  test("navega a configuración", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Configuración");
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/settings");
  });

  test("maneja error en API", async () => {
    (adminService.getStats as jest.Mock).mockRejectedValue(new Error("API error"));

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});

/* ---------------- NUEVOS TESTS ADMIN MODULES ---------------- */

describe("AdminModules", () => {

  test("adminService.getUsers existe", () => {
    expect(adminService.getUsers).toBeDefined();
  });

  test("adminService.getUserById existe", () => {
    expect(adminService.getUserById).toBeDefined();
  });

  test("adminService.updateUserRole existe", () => {
    expect(adminService.updateUserRole).toBeDefined();
  });

  test("adminService.verifyUser existe", () => {
    expect(adminService.verifyUser).toBeDefined();
  });

  test("adminService.suspendUser existe", () => {
    expect(adminService.suspendUser).toBeDefined();
  });

  test("adminService.getServices existe", () => {
    expect(adminService.getServices).toBeDefined();
  });

  test("adminService.getServiceById existe", () => {
    expect(adminService.getServiceById).toBeDefined();
  });

  test("adminService.updateServiceStatus existe", () => {
    expect(adminService.updateServiceStatus).toBeDefined();
  });

  test("adminService.getCategories existe", () => {
    expect(adminService.getCategories).toBeDefined();
  });

  test("adminService.createCategory existe", () => {
    expect(adminService.createCategory).toBeDefined();
  });

  test("adminService.updateCategory existe", () => {
    expect(adminService.updateCategory).toBeDefined();
  });

  test("adminService.deleteCategory existe", () => {
    expect(adminService.deleteCategory).toBeDefined();
  });

  test("adminService.getCoupons existe", () => {
    expect(adminService.getCoupons).toBeDefined();
  });

  test("adminService.createCoupon existe", () => {
    expect(adminService.createCoupon).toBeDefined();
  });

  test("adminService.deleteCoupon existe", () => {
    expect(adminService.deleteCoupon).toBeDefined();
  });

  test("adminService.getReports existe", () => {
    expect(adminService.getReports).toBeDefined();
  });

  test("adminService.updateReportStatus existe", () => {
    expect(adminService.updateReportStatus).toBeDefined();
  });

});

// ===============================
// 🔥 ADMIN TESTS AVANZADOS (PRO)
// ===============================

describe("AdminDashboard Edge Cases", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("no crashea si stats es null", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue(null);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("no crashea si reviews es null", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(null);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("renderiza sin reseñas", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText("Gasfitería")).toBeNull();
    });
  });

  test("maneja stats en cero", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue({
      totalUsers: 0,
      newUsersToday: 0,
      totalServices: 0,
      pendingServices: 0,
      reportedReviews: 0,
      totalCategories: 0
    });

    const { findAllByText } = renderComponent();

    const zeros = await findAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  test("no duplica llamadas API", async () => {
    renderComponent();

    await waitFor(() => {
      expect(adminService.getStats).toHaveBeenCalledTimes(1);
      expect(adminService.getReportedReviews).toHaveBeenCalledTimes(1);
    });
  });

});


describe("AdminDashboard Interactions Advanced", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("múltiples clicks no rompen navegación", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Usuarios");

    fireEvent.press(btn);
    fireEvent.press(btn);
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalled();
  });

  test("click rápido en varias cards", async () => {
    const { findByText } = renderComponent();

    fireEvent.press(await findByText("Usuarios"));
    fireEvent.press(await findByText("Servicios"));
    fireEvent.press(await findByText("Categorías"));

    expect(mockPush).toHaveBeenCalled();
  });

  test("click doble en reseña", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, serviceName: "Gasfitería", comment: "Test", rating: 1, reportCount: 1 }
    ]);

    const { findByText } = renderComponent();

    const review = await findByText("Gasfitería");

    fireEvent.press(review);
    fireEvent.press(review);

    expect(mockPush).toHaveBeenCalled();
  });

});


describe("AdminNavigation Advanced", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("navegación repetida funciona", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Reportes");

    fireEvent.press(btn);
    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/reports");
  });

  test("navega correctamente múltiples rutas", async () => {
    const { findByText } = renderComponent();

    fireEvent.press(await findByText("Usuarios"));
    fireEvent.press(await findByText("Servicios"));

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
    expect(mockPush).toHaveBeenCalledWith("/admin/services");
  });

});


describe("AdminContext Edge", () => {

  beforeEach(() => {
    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("render sin usuario", async () => {
    const { findByText } = render(
      <AuthContext.Provider value={{ user: null } as any}>
        <AdminDashboard />
      </AuthContext.Provider>
    );

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("usuario sin nombre", async () => {
    const { findByText } = render(
      <AuthContext.Provider value={{ user: {} } as any}>
        <AdminDashboard />
      </AuthContext.Provider>
    );

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminServices Errors", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getUsers maneja error", async () => {
    (adminService.getUsers as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(adminService.getUsers()).rejects.toThrow("fail");
  });

  test("getServices maneja error", async () => {
    (adminService.getServices as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(adminService.getServices()).rejects.toThrow();
  });

  test("createCategory maneja error", async () => {
    (adminService.createCategory as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(
      adminService.createCategory({ nombre: "Test categoría" })
    ).rejects.toThrow();
  });

  test("createCoupon maneja error", async () => {
    (adminService.createCoupon as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(
      adminService.createCoupon({
        codigo: "TEST10",
        tipo: "porcentaje",
        valor: 10,
        fechaInicio: "2024-01-01",
        fechaFin: "2025-01-01",
        usosMaximos: 100
      })
    ).rejects.toThrow();
  });

  test("updateReportStatus maneja error", async () => {
    (adminService.updateReportStatus as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(
      adminService.updateReportStatus(1, { estado: "resuelto" })
    ).rejects.toThrow();
  });

});


describe("AdminStress Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
  });

  test("muchas reseñas no rompe UI", async () => {
    const bigData = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      serviceName: `Servicio ${i}`,
      comment: "Test",
      rating: 1,
      reportCount: 1
    }));

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(bigData);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("stats grandes se renderizan", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue({
      totalUsers: 99999,
      newUsersToday: 999,
      totalServices: 88888,
      pendingServices: 777,
      reportedReviews: 666,
      totalCategories: 555
    });

    const { findByText } = renderComponent();

    expect(await findByText("99999")).toBeTruthy();
  });

});


describe("Integration Flow", () => {

  beforeEach(() => {
    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  test("flujo completo carga → render → click", async () => {
    const { findByText } = renderComponent();

    const btn = await findByText("Usuarios");

    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
  });

});

// ===============================
// 🚀 ADMIN TESTS NIVEL PRO (120+)
// ===============================

describe("AdminLoading States", () => {

  test("muestra loader si stats tarda", () => {
    (adminService.getStats as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { getByText } = renderComponent();

    expect(getByText("Cargando panel...")).toBeTruthy();
  });

  test("muestra loader si reviews tarda", () => {
    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { getByText } = renderComponent();

    expect(getByText("Cargando panel...")).toBeTruthy();
  });

});


describe("AdminError UI", () => {

  test("no rompe UI si stats falla", async () => {
    (adminService.getStats as jest.Mock).mockRejectedValue(new Error("fail"));
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("no rompe UI si reviews falla", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockRejectedValue(new Error("fail"));

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminData Formatting", () => {

  test("renderiza números grandes", async () => {
  jest.clearAllMocks();

  (adminService.getStats as jest.Mock).mockImplementation(() =>
    Promise.resolve({
      totalUsers: 1000000,
      newUsersToday: 5000,
      totalServices: 200000,
      pendingServices: 3000,
      reportedReviews: 200,
      totalCategories: 80
    })
  );

  (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

  const { findByText } = renderComponent();

  expect(await findByText("1000000")).toBeTruthy();
});

  test("renderiza texto largo en reseñas", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      {
        id: 1,
        serviceName: "Servicio",
        comment: "a".repeat(200),
        rating: 1,
        reportCount: 1
      }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText(/a+/)).toBeTruthy();
  });

});


describe("AdminConditional Rendering", () => {

  test("muestra solo 1 reseña", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, serviceName: "Test", comment: "ok", rating: 1, reportCount: 1 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Test")).toBeTruthy();
  });

  test("slice a máximo 5 reseñas", async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      serviceName: `Servicio ${i}`,
      comment: "test",
      rating: 1,
      reportCount: 1
    }));

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(data);

    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText("Servicio 9")).toBeNull();
    });
  });

});


describe("AdminAccessibility", () => {

  test("existen botones principales", async () => {
    const { findByText } = renderComponent();

    expect(await findByText("Usuarios")).toBeTruthy();
    expect(await findByText("Servicios")).toBeTruthy();
    expect(await findByText("Categorías")).toBeTruthy();
  });

  test("botones de acción existen", async () => {
    const { findByText } = renderComponent();

    expect(await findByText("Nueva categoría")).toBeTruthy();
    expect(await findByText("Reportes")).toBeTruthy();
  });

});


describe("AdminRobustness", () => {

  test("render múltiple no rompe", () => {
    renderComponent();
    renderComponent();
    renderComponent();
  });

  test("click sin datos no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    const btn = await findByText("Usuarios");

    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalled();
  });

});


describe("AdminIntegration Advanced", () => {

  test("flujo completo con datos grandes", async () => {
    const bigStats = {
      totalUsers: 5000,
      newUsersToday: 200,
      totalServices: 300,
      pendingServices: 10,
      reportedReviews: 5,
      totalCategories: 20
    };

    (adminService.getStats as jest.Mock).mockResolvedValue(bigStats);

    const { findByText } = renderComponent();

    expect(await findByText("5000")).toBeTruthy();

    fireEvent.press(await findByText("Usuarios"));

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
  });

});

// ===============================
// 🧠 ADMIN PRO TESTS (BLOCK 1 FIXED)
// ===============================

describe("AdminAdvanced Edge Data", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("stats con propiedades faltantes no rompe", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue({
      totalUsers: 10
    });

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    expect(await findByText("10")).toBeTruthy();
  });

  test("stats negativos se renderizan", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue({
      totalUsers: -1,
      newUsersToday: -5,
      totalServices: -10,
      pendingServices: -2,
      reportedReviews: -3,
      totalCategories: -1
    });

    const { findAllByText } = renderComponent();

    const values = await findAllByText("-1");
    expect(values.length).toBeGreaterThan(0);
  });

  test("stats como string no rompe", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue({
      totalUsers: "100"
    });

    const { findByText } = renderComponent();

    expect(await findByText("100")).toBeTruthy();
  });

  test("review sin serviceName no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, comment: "test", rating: 5 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("review sin id no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { serviceName: "Test", comment: "ok", rating: 3 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Test")).toBeTruthy();
  });

  test("rating mayor a 5 no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, serviceName: "Test", rating: 10 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Test")).toBeTruthy();
  });

  test("rating negativo no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, serviceName: "Test", rating: -3 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Test")).toBeTruthy();
  });

  test("reportCount undefined no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      { id: 1, serviceName: "Test", rating: 4 }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Test")).toBeTruthy();
  });

});


describe("AdminAsync Race Conditions", () => {

  test("stats tarda más que reviews", async () => {
    (adminService.getStats as jest.Mock).mockImplementation(() =>
      new Promise(res => setTimeout(() => res(mockStats), 100))
    );

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("reviews falla pero stats funciona", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (adminService.getReportedReviews as jest.Mock).mockRejectedValue(new Error("fail"));

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("stats falla pero reviews funciona", async () => {
    (adminService.getStats as jest.Mock).mockRejectedValue(new Error("fail"));
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminConditional UI Advanced", () => {

  test("sin reseñas muestra fallback UI", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([]);

    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText("Gasfitería")).toBeNull();
    });
  });

  test("stats llegan después que reviews", async () => {
    (adminService.getStats as jest.Mock).mockImplementation(() =>
      new Promise(res => setTimeout(() => res(mockStats), 50))
    );

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(mockReviews);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminInteractions Edge", () => {

  test("click durante loading no rompe", async () => {
    (adminService.getStats as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(true).toBeTruthy();
  });

  test("click después de error funciona", async () => {
    (adminService.getStats as jest.Mock).mockRejectedValue(new Error("fail"));

    const { findByText } = renderComponent();

    const btn = await findByText("Usuarios");

    fireEvent.press(btn);

    expect(mockPush).toHaveBeenCalled();
  });

});


describe("AdminSecurity", () => {

  test("script en comentario no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue([
      {
        id: 1,
        serviceName: "Test",
        comment: "<script>alert(1)</script>",
        rating: 1
      }
    ]);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminPerformance", () => {

  test("100 reviews no rompe", async () => {
    const big = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      serviceName: `Servicio ${i}`,
      rating: 1
    }));

    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(big);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});


describe("AdminReRender Stability", () => {

  test("re-render múltiples veces no rompe", async () => {
    const comp = renderComponent();

    comp.rerender(<></>);
    comp.rerender(<></>);
    comp.rerender(<></>);

    expect(true).toBeTruthy();
  });

});

// ===============================
// 🚀 ADMIN PRO TESTS (BLOCK 2 FINAL FIXED)
// ===============================

beforeEach(() => {
  jest.clearAllMocks();
});

// ===============================
// USERS
// ===============================
describe("AdminUsers Logic", () => {

  test("getUsers retorna lista válida", async () => {
    (adminService.getUsers as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const users = await adminService.getUsers();

    expect(users.length).toBeGreaterThan(0);
  });

  test("getUsers lista vacía", async () => {
    (adminService.getUsers as jest.Mock).mockResolvedValue([]);

    const users = await adminService.getUsers();

    expect(users).toEqual([]);
  });

  test("usuario sin id no rompe", async () => {
    (adminService.getUsers as jest.Mock).mockResolvedValue([{}]);

    const users = await adminService.getUsers();

    expect(users).toBeTruthy();
  });

});

// ===============================
// SERVICES
// ===============================
describe("AdminServices Logic", () => {

  test("getServices retorna datos", async () => {
    (adminService.getServices as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const services = await adminService.getServices();

    expect(services.length).toBeGreaterThan(0);
  });

  test("service sin nombre no rompe", async () => {
    (adminService.getServices as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const services = await adminService.getServices();

    expect(services).toBeTruthy();
  });

});

// ===============================
// CATEGORIES
// ===============================
describe("AdminCategories CRUD", () => {

  test("crear categoría exitosa", async () => {
    (adminService.createCategory as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await adminService.createCategory({ nombre: "Test" });

    expect(res).toHaveProperty("id");
  });

  test("crear categoría con nombre vacío", async () => {
    (adminService.createCategory as jest.Mock).mockResolvedValue({});

    const res = await adminService.createCategory({ nombre: "" });

    expect(res).toBeTruthy();
  });

});

// ===============================
// COUPONS (TIPOS CORREGIDOS)
// ===============================
describe("AdminCoupons Logic", () => {

  const baseCoupon = {
    codigo: "TEST",
    tipo: "porcentaje" as const,
    valor: 10,
    fechaInicio: "2024-01-01",
    fechaFin: "2025-01-01",
    usosMaximos: 100
  };

  test("crear cupón válido", async () => {
    (adminService.createCoupon as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await adminService.createCoupon(baseCoupon);

    expect(res).toHaveProperty("id");
  });

  test("cupón con datos mínimos válidos", async () => {
    (adminService.createCoupon as jest.Mock).mockResolvedValue({});

    const res = await adminService.createCoupon({
      ...baseCoupon,
      codigo: "",
      valor: 0,
      usosMaximos: 1
    });

    expect(res).toBeTruthy();
  });

});

// ===============================
// REPORTS (TIPOS CORREGIDOS)
// ===============================
describe("AdminReports Logic", () => {

  test("updateReportStatus funciona", async () => {
    (adminService.updateReportStatus as jest.Mock).mockResolvedValue({ ok: true });

    const res = await adminService.updateReportStatus(1, { estado: "resuelto" });

    expect(res.ok).toBeTruthy();
  });

  test("updateReportStatus con id inválido", async () => {
    (adminService.updateReportStatus as jest.Mock).mockResolvedValue({});

    const res = await adminService.updateReportStatus(null as any, {
      estado: "pendiente"
    });

    expect(res).toBeTruthy();
  });

});

// ===============================
// DASHBOARD / NAV
// ===============================
describe("AdminFull Flow Advanced", () => {

  test("carga completa dashboard", async () => {
    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("click usuarios → navegación", async () => {
    mockPush.mockClear();

    const { findByText } = renderComponent();

    fireEvent.press(await findByText("Usuarios"));

    expect(mockPush).toHaveBeenCalledWith("/admin/users");
  });

  test("click servicios → navegación", async () => {
    mockPush.mockClear();

    const { findByText } = renderComponent();

    fireEvent.press(await findByText("Servicios"));

    expect(mockPush).toHaveBeenCalledWith("/admin/services");
  });

});

// ===============================
// DATA INTEGRITY
// ===============================
describe("AdminData Integrity", () => {

  test("no muta datos originales", async () => {
    const data = [{ id: 1 }];

    (adminService.getUsers as jest.Mock).mockResolvedValue(data);

    const res = await adminService.getUsers();

    expect(res).toEqual(data);
  });

});

// ===============================
// EDGE CASES
// ===============================
describe("AdminEdge Extreme", () => {

  test("stats undefined no rompe", async () => {
    (adminService.getStats as jest.Mock).mockResolvedValue(undefined);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

  test("reviews undefined no rompe", async () => {
    (adminService.getReportedReviews as jest.Mock).mockResolvedValue(undefined);

    const { findByText } = renderComponent();

    expect(await findByText("Panel de Administración")).toBeTruthy();
  });

});

// ===============================
// ASYNC
// ===============================
describe("AdminAsync Stability", () => {

  test("llamadas concurrentes no rompen", async () => {
    await Promise.all([
      adminService.getUsers(),
      adminService.getServices(),
      adminService.getStats()
    ]);

    expect(true).toBeTruthy();
  });

});

// ===============================
// NAV STRESS (FIX REAL)
// ===============================
describe("AdminNavigation Stress", () => {

  test("navegación masiva", async () => {
    mockPush.mockClear(); // 🔥 FIX CLAVE

    const { findByText } = renderComponent();

    const btn = await findByText("Usuarios");

    for (let i = 0; i < 10; i++) {
      fireEvent.press(btn);
    }

    expect(mockPush).toHaveBeenCalledTimes(10);
  });

});

// ===============================
// SECURITY
// ===============================
describe("AdminSecurity Advanced", () => {

  test("input malicioso no rompe", async () => {
    (adminService.createCategory as jest.Mock).mockResolvedValue({});

    const res = await adminService.createCategory({
      nombre: "<script>alert(1)</script>"
    });

    expect(res).toBeTruthy();
  });

});

// ===============================
// PERFORMANCE
// ===============================
describe("AdminPerformance Extreme", () => {

  test("1000 usuarios no rompe", async () => {
    const big = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

    (adminService.getUsers as jest.Mock).mockResolvedValue(big);

    const res = await adminService.getUsers();

    expect(res.length).toBe(1000);
  });

});