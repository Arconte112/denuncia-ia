import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/api/auth/login'];

// Rutas que comienzan con estos prefijos se consideran públicas
const publicPathPrefixes = [
  '/_next', 
  '/favicon.ico', 
  '/images/', 
  '/audio/',
  '/api/twilio' // Webhooks de Twilio deben ser públicos
];

// Clave secreta para verificar el JWT - debe coincidir con la usada para firmar
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Añadir encabezados para el manejo de errores y debugging
  response.headers.set('X-Debug-Mode', 'enabled');
  
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta es pública
  if (publicRoutes.includes(pathname)) {
    return response;
  }
  
  // Verificar si la ruta comienza con un prefijo público
  const isPublicPath = publicPathPrefixes.some(prefix => pathname.startsWith(prefix));
  if (isPublicPath) {
    return response;
  }
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // Si no hay token, redirigir al login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return response;
  }
  
  try {
    // Verificar el token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    // Si estamos en la ruta de login y el usuario está autenticado, redirigir al dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Usuario autenticado, continuar
    return response;
  } catch (error) {
    // Token inválido, redirigir al login
    console.error('Error verificando token:', error);
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    
    // Limpiar la cookie inválida
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth_token');
    
    return response;
  }
}

// Configurar las rutas que usarán este middleware
export const config = {
  matcher: [
    // Aplicar a todas las rutas API
    '/api/:path*',
    // Excluir rutas de archivos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 