import { supabase, User, Call, Complaint, ComplaintComment, ComplaintHistory, Setting } from './supabase';

// Servicio para usuarios
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data as User[];
  },
  
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
    
    return data as User;
  },
  
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      return null;
    }
    
    return data as User;
  }
};

// Servicio para llamadas
export const callService = {
  async getAll(): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching calls:', error);
      return [];
    }
    
    return data as Call[];
  },
  
  async getById(id: string): Promise<Call | null> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching call with ID ${id}:`, error);
      return null;
    }
    
    return data as Call;
  },
  
  async create(call: Partial<Call>): Promise<Call | null> {
    const { data, error } = await supabase
      .from('calls')
      .insert(call)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating call:', error);
      return null;
    }
    
    return data as Call;
  },
  
  async update(id: string, updates: Partial<Call>): Promise<Call | null> {
    const { data, error } = await supabase
      .from('calls')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating call with ID ${id}:`, error);
      return null;
    }
    
    return data as Call;
  }
};

// Servicio para denuncias
export const complaintService = {
  async getAll(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        call:calls(*),
        assigned_user:users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
    
    return data as Complaint[];
  },
  
  async getById(id: string): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        call:calls(*),
        assigned_user:users(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching complaint with ID ${id}:`, error);
      return null;
    }
    
    return data as Complaint;
  },
  
  async create(complaint: Partial<Complaint>): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .insert(complaint)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating complaint:', error);
      return null;
    }
    
    // Actualizar la llamada asociada para indicar que tiene una denuncia
    if (data && complaint.call_id) {
      await callService.update(complaint.call_id, { has_complaint: true });
    }
    
    return data as Complaint;
  },
  
  async update(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating complaint with ID ${id}:`, error);
      return null;
    }
    
    return data as Complaint;
  },
  
  async updateStatus(
    id: string, 
    newStatus: 'new' | 'in_progress' | 'resolved' | 'closed', 
    userId?: string, 
    notes?: string
  ): Promise<Complaint | null> {
    // Obtener el estado actual
    const currentComplaint = await this.getById(id);
    if (!currentComplaint) return null;
    
    // Crear registro en el historial
    await supabase.from('complaint_history').insert({
      complaint_id: id,
      user_id: userId || null,
      old_status: currentComplaint.status,
      new_status: newStatus,
      notes: notes || null
    });
    
    // Actualizar el estado de la denuncia
    return this.update(id, { status: newStatus });
  },
  
  async getComments(complaintId: string): Promise<ComplaintComment[]> {
    const { data, error } = await supabase
      .from('complaint_comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error(`Error fetching comments for complaint ${complaintId}:`, error);
      return [];
    }
    
    return data as ComplaintComment[];
  },
  
  async addComment(complaintId: string, userId: string, comment: string): Promise<ComplaintComment | null> {
    const { data, error } = await supabase
      .from('complaint_comments')
      .insert({
        complaint_id: complaintId,
        user_id: userId,
        comment
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error adding comment to complaint ${complaintId}:`, error);
      return null;
    }
    
    return data as ComplaintComment;
  },
  
  async getHistory(complaintId: string): Promise<ComplaintHistory[]> {
    const { data, error } = await supabase
      .from('complaint_history')
      .select(`
        *,
        user:users(*)
      `)
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error(`Error fetching history for complaint ${complaintId}:`, error);
      return [];
    }
    
    return data as ComplaintHistory[];
  }
};

// Servicio para configuraciones
export const settingService = {
  async getAll(): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
    
    return data as Setting[];
  },
  
  async getByKey(key: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error(`Error fetching setting with key ${key}:`, error);
      return null;
    }
    
    return data as Setting;
  },
  
  async getValue(key: string): Promise<string | null> {
    const setting = await this.getByKey(key);
    return setting ? setting.value : null;
  },
  
  async update(key: string, value: string, userId?: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: userId || null
      })
      .eq('key', key)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating setting with key ${key}:`, error);
      return null;
    }
    
    return data as Setting;
  }
}; 