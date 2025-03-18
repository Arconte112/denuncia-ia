import { NextResponse } from 'next/server';
import { callService, complaintService } from '@/lib/db-service';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Obtener todas las llamadas y denuncias
    const calls = await callService.getAll();
    const complaints = await complaintService.getAll();
    
    // Calcular estadísticas básicas
    const totalCalls = calls.length;
    const totalComplaints = complaints.length;
    
    // Calcular tasa de conversión
    const conversionRate = totalCalls > 0 
      ? Math.round((totalComplaints / totalCalls) * 100) 
      : 0;
    
    // Calcular tiempo promedio de llamadas
    let totalDuration = 0;
    let validCalls = 0;
    
    calls.forEach(call => {
      if (call.duration !== null) {
        totalDuration += call.duration;
        validCalls++;
      }
    });
    
    const avgDuration = validCalls > 0 ? Math.round(totalDuration / validCalls) : 0;
    const avgMinutes = Math.floor(avgDuration / 60);
    const avgSeconds = avgDuration % 60;
    const formattedAvgDuration = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
    
    // Contar denuncias por estado
    const complaintsByStatus = {
      new: complaints.filter(c => c.status === 'new').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      closed: complaints.filter(c => c.status === 'closed').length
    };
    
    // Contar denuncias por categoría (top 5)
    const categoriesMap = new Map();
    complaints.forEach(complaint => {
      if (complaint.category) {
        const category = complaint.category;
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
      }
    });
    
    // Convertir el mapa de categorías a un array ordenado
    const categoriesArray = Array.from(categoriesMap.entries())
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);  // Top 5 categorías
    
    // Obtener las últimas 5 denuncias
    const latestComplaints = complaints
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        category: c.category || 'Sin categoría',
        created_at: c.created_at,
        status: c.status
      }));
    
    // Obtener datos para el gráfico de tendencia (últimos 6 meses)
    const now = new Date();
    const monthsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Filtrar llamadas y denuncias para este mes
      const monthCalls = calls.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate.getMonth() === month.getMonth() && 
               callDate.getFullYear() === month.getFullYear();
      }).length;
      
      const monthComplaints = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.created_at);
        return complaintDate.getMonth() === month.getMonth() && 
               complaintDate.getFullYear() === month.getFullYear();
      }).length;
      
      monthsData.push({
        name: monthName,
        llamadas: monthCalls,
        denuncias: monthComplaints
      });
    }
    
    // Calcular el cambio porcentual respecto al mes anterior
    const currentMonthCalls = calls.filter(call => {
      const callDate = new Date(call.timestamp);
      return callDate.getMonth() === now.getMonth() && 
             callDate.getFullYear() === now.getFullYear();
    }).length;
    
    const prevMonthCalls = calls.filter(call => {
      const callDate = new Date(call.timestamp);
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return callDate.getMonth() === prevMonth.getMonth() && 
             callDate.getFullYear() === prevMonth.getFullYear();
    }).length;
    
    const callsChange = prevMonthCalls > 0 
      ? Math.round(((currentMonthCalls - prevMonthCalls) / prevMonthCalls) * 100) 
      : 100; // Si no hay llamadas en el mes anterior, es un 100% de incremento
    
    const currentMonthComplaints = complaints.filter(c => {
      const date = new Date(c.created_at);
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear();
    }).length;
    
    const prevMonthComplaints = complaints.filter(c => {
      const date = new Date(c.created_at);
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === prevMonth.getMonth() && 
             date.getFullYear() === prevMonth.getFullYear();
    }).length;
    
    const complaintsChange = prevMonthComplaints > 0 
      ? Math.round(((currentMonthComplaints - prevMonthComplaints) / prevMonthComplaints) * 100) 
      : 100;
    
    const processedRate = totalComplaints > 0 
      ? Math.round(((complaintsByStatus.resolved + complaintsByStatus.closed) / totalComplaints) * 100) 
      : 0;
    
    return NextResponse.json({
      statsData: [
        {
          title: "Total Denuncias",
          value: totalComplaints.toString(),
          description: `${complaintsChange}% ${complaintsChange >= 0 ? 'más' : 'menos'} que el mes pasado`,
          icon: "FileText"
        },
        {
          title: "Llamadas Recibidas",
          value: totalCalls.toString(),
          description: `${callsChange}% ${callsChange >= 0 ? 'más' : 'menos'} que el mes pasado`,
          icon: "Phone"
        },
        {
          title: "Denuncias Procesadas",
          value: (complaintsByStatus.resolved + complaintsByStatus.closed).toString(),
          description: `${processedRate}% de las denuncias totales`,
          icon: "UserCheck"
        },
        {
          title: "Tiempo Promedio",
          value: formattedAvgDuration,
          description: "Duración promedio de llamadas",
          icon: "Activity"
        }
      ],
      chartData: monthsData,
      typeData: categoriesArray,
      latestComplaints,
      statusDistribution: complaintsByStatus
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
} 