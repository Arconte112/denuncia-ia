"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, loading, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError("Por favor ingrese su correo y contraseña");
      return;
    }
    
    try {
      setLocalError(null);
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      // El error ya es manejado por el contexto de autenticación
    }
  };

  // Mostrar cualquier error, sea local o del contexto de autenticación
  const errorMessage = localError || authError;

  return (
    <div className="flex h-screen">
      {/* Lado izquierdo - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={120} 
                height={120}
                className="dark:invert"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Sistema de Denuncias - v1.0
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Lado derecho - Imagen */}
      <div className="hidden lg:block lg:w-1/2 bg-primary relative">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-12">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Sistema de Denuncias
          </h1>
          <p className="text-white/90 text-center max-w-md text-lg">
            Plataforma para la gestión y seguimiento de denuncias recibidas a través de llamadas telefónicas.
          </p>
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('/images/login-background.jpg')" }}
        ></div>
      </div>
    </div>
  );
} 