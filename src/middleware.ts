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
  '/api/twilio', // Webhooks de Twilio deben ser públicos
  '/public/',
  '/voiceguard-logo.png' // Logo específico
];

// API routes that should return proper error responses instead of redirecting
const apiRoutes = ['/api/auth/me', '/api/auth/login', '/api/auth/logout'];

// Clave secreta para verificar el JWT - debe coincidir con la usada para firmar
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta es pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Verificar si la ruta comienza con un prefijo público
  const isPublicPath = publicPathPrefixes.some(prefix => pathname.startsWith(prefix));
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // Handle API routes that require auth differently - return error responses instead of redirects
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route));
  
  // Si no hay token
  if (!token) {
    // For API routes, return JSON error instead of redirecting
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: 'No autenticado' }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' } 
        }
      );
    }
    
    // For regular routes, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
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
    return NextResponse.next();
  } catch (error) {
    // Token inválido
    console.error('Error verificando token:', error);
    
    // For API routes, return JSON error
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido' }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' } 
        }
      );
    }
    
    // For regular routes, redirect to login
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
    // Aplicar a todas las rutas excepto las estáticas específicas
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 