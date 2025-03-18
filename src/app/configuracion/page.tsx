"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Save, Phone, Upload, Mic, RefreshCw } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Administra la configuración de la plataforma de denuncias
          </p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="twilio">Twilio</TabsTrigger>
            <TabsTrigger value="whisper">Whisper AI</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>
                  Ajustes básicos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Nombre de la Plataforma</Label>
                    <Input id="platform-name" defaultValue="Plataforma de Denuncias IA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email de Administrador</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform-description">Descripción</Label>
                  <Textarea 
                    id="platform-description" 
                    defaultValue="Sistema para recibir y gestionar denuncias mediante llamadas telefónicas transcritas con inteligencia artificial."
                  />
                </div>

                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="twilio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Twilio</CardTitle>
                <CardDescription>
                  Configuración para recibir llamadas entrantes de denuncias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-sid">Account SID</Label>
                    <Input id="twilio-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-token">Auth Token</Label>
                    <Input id="twilio-token" type="password" placeholder="••••••••••••••••••••••••••••••" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-phone">Número de Recepción</Label>
                    <Input id="twilio-phone" placeholder="+1234567890" />
                    <p className="text-xs text-muted-foreground">
                      Este es el número que se publicará para recibir denuncias
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-webhook">URL de Webhook</Label>
                    <Input id="twilio-webhook" defaultValue="https://tu-dominio.com/api/twilio" />
                    <p className="text-xs text-muted-foreground">
                      URL que procesará las llamadas entrantes
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                  <Button variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Verificar Número
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whisper" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Whisper AI</CardTitle>
                <CardDescription>
                  Configuración para la transcripción de audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key de OpenAI</Label>
                  <Input id="openai-key" type="password" placeholder="sk-•••••••••••••••••••••••••••••••••••••••••••••" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whisper-model">Modelo de Whisper</Label>
                    <select id="whisper-model" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="whisper-1">whisper-1 (Estándar)</option>
                      <option value="whisper-large">whisper-large (Mayor precisión)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whisper-language">Idioma Preferido</Label>
                    <select id="whisper-language" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                      <option value="auto">Detección Automática</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                  <Button variant="outline">
                    <Mic className="mr-2 h-4 w-4" />
                    Probar Transcripción
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Audio</CardTitle>
                <CardDescription>
                  Configuración para los archivos de audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-audio">Audio de Bienvenida</Label>
                  <div className="flex items-center gap-2">
                    <Input id="welcome-audio" disabled defaultValue="welcome.mp3" />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este audio se reproducirá cuando alguien llame al número de denuncias
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="p-4 bg-secondary/50 rounded-md">
                    <audio controls className="w-full">
                      <source src="/audio/welcome.mp3" type="audio/mpeg" />
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audio-format">Formato de Audio</Label>
                    <select id="audio-format" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="ogg">OGG</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audio-quality">Calidad de Audio</Label>
                    <select id="audio-quality" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="high">Alta (128kbps)</option>
                      <option value="medium">Media (64kbps)</option>
                      <option value="low">Baja (32kbps)</option>
                    </select>
                  </div>
                </div>

                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar Configuración
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 