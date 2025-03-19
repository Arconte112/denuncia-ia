import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
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
  
  // Si no hay token, redirigir al login
  if (!token) {
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

// Configurar en qué rutas se debe aplicar el middleware
export const config = {
  matcher: [
    // Rutas que requieren protección
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 