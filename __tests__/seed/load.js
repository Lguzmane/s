const BASE_URL = 'http://localhost:3000/api';

// =======================
// HELPERS
// =======================

async function api(path, method = 'GET', body = null, token = null) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(body && { body: JSON.stringify(body) })
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.error(`❌ ${method} ${path}`);
      console.error(res.status, '-', JSON.stringify(data));
      return null;
    }

    console.log(`✅ ${method} ${path}`);
    return data;
  } catch (err) {
    console.error(`❌ ERROR ${method} ${path}`, err.message);
    return null;
  }
}

async function register(user) {
  return await api('/auth/register', 'POST', user);
}

async function login(email, password) {
  return await api('/auth/login', 'POST', { email, password });
}

// =======================
// DATA
// =======================

const users = [
  {
    nombre: 'Carolina',
    apellidoPaterno: 'Muñoz',
    apellidoMaterno: 'Test',
    email: 'carolina@test.cl',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    region: 'RM',
    comuna: 'Las Condes',
    tipoUsuario: 'Profesional',
    telefono: '+56912345678'
  },
  {
    nombre: 'Felipe',
    apellidoPaterno: 'Torres',
    apellidoMaterno: 'Test',
    email: 'felipe@test.cl',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    region: 'RM',
    comuna: 'Providencia',
    tipoUsuario: 'Profesional',
    telefono: '+56987654321'
  },
  {
    nombre: 'Andrea',
    apellidoPaterno: 'Soto',
    apellidoMaterno: 'Test',
    email: 'andrea@test.cl',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    region: 'RM',
    comuna: 'Ñuñoa',
    tipoUsuario: 'Profesional',
    telefono: '+56956781234'
  },
  {
    nombre: 'Javiera',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Test',
    email: 'javiera@test.cl',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    region: 'RM',
    comuna: 'Santiago',
    tipoUsuario: 'Cliente',
    telefono: '+56933445566'
  },
  {
    nombre: 'Matías',
    apellidoPaterno: 'Fernández',
    apellidoMaterno: 'Test',
    email: 'matias@test.cl',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    region: 'RM',
    comuna: 'La Florida',
    tipoUsuario: 'Cliente',
    telefono: '+56999887766'
  }
];

// =======================
// MAIN
// =======================

(async () => {
  console.log('🚀 INICIANDO SEED...\n');

  const tokens = {};
  const userIds = {};

  // 1. REGISTER + LOGIN
  for (const user of users) {
    await register(user);

    const loginRes = await login(user.email, user.password);
    if (loginRes?.token) {
      tokens[user.email] = loginRes.token;
      userIds[user.email] = loginRes.user?.id;
      console.log(`🔑 Token: ${user.email}`);
    }
  }

  // 2. ADMIN LOGIN
  const adminLogin = await login('lorenaguzmanelgueta@gmail.com', 'Zte34ds.1');

  if (!adminLogin?.token) {
    console.error('❌ Admin login falló');
    process.exit(1);
  }

  const adminToken = adminLogin.token;
  console.log('\n🔑 Admin autenticado\n');

  // 3. CREAR SERVICIOS (CON profesionalId REAL)
  const services = [
    {
      nombre: 'Corte mujer',
      precio: 18000,
      profesionalId: userIds['carolina@test.cl'],
      duracionMin: 60
    },
    {
      nombre: 'Brushing',
      precio: 12000,
      profesionalId: userIds['carolina@test.cl'],
      duracionMin: 45
    },
    {
      nombre: 'Coloración',
      precio: 35000,
      profesionalId: userIds['carolina@test.cl'],
      duracionMin: 120
    },
    {
      nombre: 'Corte hombre',
      precio: 12000,
      profesionalId: userIds['felipe@test.cl'],
      duracionMin: 30
    },
    {
      nombre: 'Barba',
      precio: 8000,
      profesionalId: userIds['felipe@test.cl'],
      duracionMin: 20
    },
    {
      nombre: 'Corte + barba',
      precio: 18000,
      profesionalId: userIds['felipe@test.cl'],
      duracionMin: 45
    },
    {
      nombre: 'Manicure',
      precio: 15000,
      profesionalId: userIds['andrea@test.cl'],
      duracionMin: 60
    },
    {
      nombre: 'Pedicure',
      precio: 17000,
      profesionalId: userIds['andrea@test.cl'],
      duracionMin: 60
    },
    {
      nombre: 'Uñas acrílicas',
      precio: 30000,
      profesionalId: userIds['andrea@test.cl'],
      duracionMin: 90
    }
  ];

  const createdServices = [];

  for (const s of services) {
    const res = await api('/services', 'POST', s, adminToken);
    
    let serviceId = null;
    let serviceData = null;
    
    if (res?.data?.id) {
      serviceId = res.data.id;
      serviceData = res.data;
    } else if (res?.id) {
      serviceId = res.id;
      serviceData = res;
    } else if (res?.data?.data?.id) {
      serviceId = res.data.data.id;
      serviceData = res.data.data;
    }
    
    if (serviceId) {
      createdServices.push({ ...s, id: serviceId, ...serviceData });
      console.log(`   ✅ Servicio ID: ${serviceId} - ${s.nombre}`);
    } else {
      console.log(`   ⚠️ No se pudo obtener ID para: ${s.nombre}`);
    }
  }

  console.log('\n📊 Servicios creados:', createdServices.length);
  console.log('🔍 Primer servicio ID:', createdServices[0]?.id);
  console.log('👤 Token Javiera:', tokens['javiera@test.cl'] ? '✅' : '❌');
  console.log('👤 Token Matías:', tokens['matias@test.cl'] ? '✅' : '❌');

  // ========================
  // 4. CREAR DISPONIBILIDAD PARA PROFESIONALES
  // ========================
  console.log('\n📅 Creando disponibilidad...');

  const profesionalesIds = [
    userIds['carolina@test.cl'],
    userIds['felipe@test.cl'],
    userIds['andrea@test.cl']
  ];

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  
  const slotsDisponibles = [];

  for (const profId of profesionalesIds) {
    if (!profId) continue;
    
    console.log(`\n📅 Creando disponibilidad para profesional ID: ${profId}`);
    
    for (let i = 0; i < 3; i++) {
      const horaInicio = new Date(manana);
      horaInicio.setHours(9 + i * 3, 0, 0, 0);
      
      const horaFin = new Date(horaInicio);
      horaFin.setHours(horaInicio.getHours() + 2);
      
      const fechaStr = horaInicio.toISOString().split('T')[0];
      
      const res = await api(
        '/availability',
        'POST',
        {
          profesionalId: profId,
          fecha: fechaStr,
          horaInicio: horaInicio.toISOString(),
          horaFin: horaFin.toISOString(),
          estado: 'disponible'
        },
        adminToken
      );
      
      if (res?.data?.id || res?.id) {
        slotsDisponibles.push({
          profesionalId: profId,
          fechaHora: horaInicio.toISOString(),
          duracion: 120
        });
        console.log(`   ✅ Slot creado: ${horaInicio.toLocaleTimeString()}`);
      } else {
        console.log(`   ⚠️ Slot ya existe: ${horaInicio.toLocaleTimeString()}`);
      }
    }
  }

  // ========================
  // 5. BOOKINGS (RESERVAS)
  // ========================
  console.log('\n📅 Creando reservas...');

  const slotCarolina = slotsDisponibles.find(s => s.profesionalId === userIds['carolina@test.cl']);
  const slotFelipe = slotsDisponibles.find(s => s.profesionalId === userIds['felipe@test.cl']);

  const bookings = [
    {
      clienteId: userIds['javiera@test.cl'],
      profesionalId: userIds['carolina@test.cl'],
      servicioId: createdServices[0]?.id,
      fechaHora: slotCarolina?.fechaHora || new Date(manana.setHours(9, 0, 0, 0)).toISOString(),
      duracionMin: 60,
      monto: 18000
    },
    {
      clienteId: userIds['matias@test.cl'],
      profesionalId: userIds['felipe@test.cl'],
      servicioId: createdServices[3]?.id,
      fechaHora: slotFelipe?.fechaHora || new Date(manana.setHours(12, 0, 0, 0)).toISOString(),
      duracionMin: 30,
      monto: 12000
    }
  ];

  const createdBookings = [];

  for (const b of bookings) {
    if (!b.servicioId) {
      console.log('⚠️ Booking saltado: servicioId undefined');
      continue;
    }
    
    const tokenCliente = b.clienteId === userIds['javiera@test.cl'] 
      ? tokens['javiera@test.cl'] 
      : tokens['matias@test.cl'];
    
    const res = await api('/bookings', 'POST', b, tokenCliente);
    if (res?.data?.id) {
      createdBookings.push(res.data);
      console.log(`   ✅ Booking creado ID: ${res.data.id}`);
    } else if (res?.id) {
      createdBookings.push(res);
      console.log(`   ✅ Booking creado ID: ${res.id}`);
    }
  }

  // ========================
  // 6. REVIEWS
  // ========================
  console.log('\n📝 Creando reseñas...');

  for (const b of createdBookings) {
    const tokenCliente = b.clienteId === userIds['javiera@test.cl'] 
      ? tokens['javiera@test.cl'] 
      : tokens['matias@test.cl'];
    
    await api(
      '/reviews',
      'POST',
      {
        reservaId: b.id,
        clienteId: b.clienteId,
        profesionalId: b.profesionalId,
        servicioId: b.servicioId,
        calificacion: 5,
        comentario: 'Excelente servicio'
      },
      tokenCliente
    );
  }

  // ========================
  // 7. FAVORITOS
  // ========================
  console.log('\n❤️ Creando favoritos...');

  if (createdServices[0]?.id && tokens['javiera@test.cl']) {
    await api(
      '/favorites',
      'POST',
      {
        usuarioId: userIds['javiera@test.cl'],
        servicioId: createdServices[0]?.id
      },
      tokens['javiera@test.cl']
    );
  }

  // ========================
  // 8. PAGOS
  // ========================
  console.log('\n💰 Creando pagos...');

  for (const b of createdBookings) {
    const tokenCliente = b.clienteId === userIds['javiera@test.cl'] 
      ? tokens['javiera@test.cl'] 
      : tokens['matias@test.cl'];
    
    await api(
      '/payments',
      'POST',
      {
        reservaId: b.id,
        monto: b.monto,
        metodoPago: 'webpay'
      },
      tokenCliente
    );
  }

  // ========================
  // 9. CUPONES
  // ========================
  console.log('\n🎫 Creando cupón...');

  await api(
    '/coupon',
    'POST',
    {
      codigo: `DESCUENTO${Date.now()}`,
      tipo: 'porcentaje',
      valor: 10,
      fechaInicio: new Date().toISOString(),
      fechaFin: new Date(Date.now() + 7 * 86400000).toISOString(),
      usosMaximos: 100
    },
    adminToken
  );

  console.log('\n🎉 SEED COMPLETO TERMINADO');
})();