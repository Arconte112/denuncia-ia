import { createClient } from '@supabase/supabase-js';

// Estos valores deben estar en variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mejor manejo de errores para la configuración de Supabase
if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase URL or API key is missing. Please check your environment variables.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Undefined');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined');
}

// Crear cliente de Supabase con validación
export const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar si el cliente está funcionando correctamente
try {
  // Realizar una operación simple para verificar la conexión
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
    } else {
      console.log('Supabase client initialized successfully');
    }
  });
} catch (error) {
  console.error('Critical error initializing Supabase client:', error);
}

// Tipos para las tablas de nuestra base de datos
export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator';
  password: string;
  created_at: string;
  updated_at: string;
};

export type Call = {
  id: string;
  call_sid: string;
  phone_number: string;
  timestamp: string;
  duration: number | null;
  status: 'in_progress' | 'completed' | 'failed';
  audio_url: string | null;
  recording_sid: string | null;
  has_complaint: boolean;
  notes: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Complaint = {
  id: string;
  call_id: string;
  transcription: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: string | null;
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  call?: Call;
  assigned_user?: User;
};

export type ComplaintComment = {
  id: string;
  complaint_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: User;
};

export type ComplaintHistory = {
  id: string;
  complaint_id: string;
  user_id: string | null;
  old_status: 'new' | 'in_progress' | 'resolved' | 'closed' | null;
  new_status: 'new' | 'in_progress' | 'resolved' | 'closed';
  notes: string | null;
  created_at: string;
  user?: User;
};

export type Setting = {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}; 