"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Definir el tipo de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para utilizar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Props para el proveedor
interface AuthProviderProps {
  children: ReactNode;
}

// Componente proveedor que proporciona el contexto de autenticación
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    async function checkAuth() {
      try {
        // Intentar obtener la información del usuario actual
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          try {
            const data = await response.json();
            setUser(data.user);
          } catch (jsonError) {
            console.error('Error al parsear JSON de respuesta:', jsonError);
            console.log('Texto de respuesta:', await response.text());
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error al verificar la autenticación:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    }

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      const data = await response.json();
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error('Error al cerrar sesión');
      }
      
      // Incluso si hay un error, limpiamos el estado local
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading: loading && !initialCheckDone,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 