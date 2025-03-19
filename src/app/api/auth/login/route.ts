import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SignJWT } from 'jose';

// Clave secreta para firmar el JWT - esto debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validar que se proporcionaron email y password
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    // Buscar el usuario en la base de datos
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      console.error('Error al buscar usuario:', error);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar la contraseña directamente sin usar bcrypt
    // Ahora comparamos con el campo password en lugar de password_hash
    const isValid = password === user.password;
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Crear un JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h') // Token válido por 8 horas
      .sign(new TextEncoder().encode(JWT_SECRET));
    
    // Preparar la respuesta con los datos del usuario
    const userData = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role
    };
    
    // Crear la respuesta y establecer la cookie
    const response = NextResponse.json({ user: userData });
    
    // Establecer la cookie con el token JWT
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 horas en segundos
      sameSite: 'lax',
    });
    
    return response;
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de login' },
      { status: 500 }
    );
  }
} 