import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear respuesta y eliminar la cookie de autenticación
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
    
    // Borrar la cookie de autenticación
    response.cookies.delete({
      name: 'auth_token',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
} 