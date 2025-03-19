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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage complaint platform settings
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
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="VoiceGuard Platform" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform-description">Description</Label>
                  <Textarea 
                    id="platform-description" 
                    defaultValue="System to receive and manage complaints through phone calls transcribed with artificial intelligence."
                  />
                </div>

                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="twilio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Twilio Settings</CardTitle>
                <CardDescription>
                  Configuration for receiving incoming complaint calls
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
                    <Label htmlFor="twilio-phone">Reception Number</Label>
                    <Input id="twilio-phone" placeholder="+1234567890" />
                    <p className="text-xs text-muted-foreground">
                      This is the number that will be published to receive complaints
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-webhook">Webhook URL</Label>
                    <Input id="twilio-webhook" defaultValue="https://your-domain.com/api/twilio" />
                    <p className="text-xs text-muted-foreground">
                      URL that will process incoming calls
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Verify Number
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whisper" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Whisper AI Settings</CardTitle>
                <CardDescription>
                  Configuration for audio transcription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input id="openai-key" type="password" placeholder="sk-•••••••••••••••••••••••••••••••••••••••••••••" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whisper-model">Whisper Model</Label>
                    <select id="whisper-model" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="whisper-1">whisper-1 (Standard)</option>
                      <option value="whisper-large">whisper-large (Higher accuracy)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whisper-language">Preferred Language</Label>
                    <select id="whisper-language" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="es">Spanish</option>
                      <option value="en">English</option>
                      <option value="auto">Automatic Detection</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    <Mic className="mr-2 h-4 w-4" />
                    Test Transcription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Configuration for audio files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-audio">Welcome Audio</Label>
                  <div className="flex items-center gap-2">
                    <Input id="welcome-audio" disabled defaultValue="welcome.mp3" />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This audio will play when someone calls the complaint number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-4 bg-secondary/50 rounded-md">
                    <audio controls className="w-full">
                      <source src="/audio/welcome.mp3" type="audio/mpeg" />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audio-format">Audio Format</Label>
                    <select id="audio-format" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="ogg">OGG</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audio-quality">Audio Quality</Label>
                    <select id="audio-quality" className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option value="high">High (128kbps)</option>
                      <option value="medium">Medium (64kbps)</option>
                      <option value="low">Low (32kbps)</option>
                    </select>
                  </div>
                </div>

                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 