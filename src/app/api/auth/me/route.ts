import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';

// Clave secreta para verificar el JWT
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export async function GET(request: Request) {
  try {
    // Obtener la cookie de autenticación
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, ...rest] = cookie.split('=');
        return [name, rest.join('=')];
      })
    );
    
    const token = cookies['auth_token'];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar el token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    if (!payload.id || typeof payload.id !== 'string') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    // Obtener información actualizada del usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', payload.id)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }
    
    // Devolver los datos del usuario
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }
} 