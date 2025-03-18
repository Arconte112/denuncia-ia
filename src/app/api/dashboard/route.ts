import { NextResponse } from 'next/server';
import { complaintService, callService } from '@/lib/db-service';

export async function GET() {
  try {
    // Obtener datos reales de la base de datos
    const complaints = await complaintService.getAll();
    const calls = await callService.getAll();
    
    // Calcular estadísticas
    const totalCalls = calls.length;
    const totalComplaints = complaints.length;
    
    // Obtener conteos por estado
    const newComplaints = complaints.filter(c => c.status === 'new').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const closedComplaints = complaints.filter(c => c.status === 'closed').length;
    
    // Obtener llamadas más recientes (últimas 5)
    const recentCalls = calls
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Estadísticas de denuncias por categoría
    const categoryCounts = complaints.reduce((acc, complaint) => {
      const category = complaint.category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convertir a array para mejor manejo en el frontend
    const categoriesStats = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    return NextResponse.json({
      overview: {
        totalCalls,
        totalComplaints,
        newComplaints,
        inProgressComplaints,
        resolvedComplaints,
        closedComplaints
      },
      recentCalls,
      categoriesStats
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
} 