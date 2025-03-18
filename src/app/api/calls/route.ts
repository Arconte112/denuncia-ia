import { NextResponse } from 'next/server';
import { callService } from '@/lib/db-service';

export async function GET() {
  try {
    // Obtener todas las llamadas de la base de datos
    const calls = await callService.getAll();
    
    // Ordenar por fecha (más recientes primero)
    const sortedCalls = calls.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedCalls);
  } catch (error) {
    console.error('Error al obtener llamadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las llamadas' },
      { status: 500 }
    );
  }
} 