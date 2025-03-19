import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Phone, Settings } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import Image from "next/image";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Complaints",
      href: "/denuncias",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Incoming Calls",
      href: "/llamadas",
      icon: <Phone className="h-5 w-5" />,
    },
  ];
  
  // Agregar configuración solo si el usuario no tiene rol 'user'
  if (user?.role !== 'user') {
    menuItems.push({
      name: "Settings",
      href: "/configuracion",
      icon: <Settings className="h-5 w-5" />,
    });
  }

  return (
    <div className={`h-screen w-64 border-r bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 pb-6 pt-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image 
            src="/voiceguard-logo.png" 
            alt="VoiceGuard Logo" 
            width={32} 
            height={32} 
          />
          <span className="text-xl font-bold">VoiceGuard</span>
        </Link>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${
              isActive(item.href) ? "sidebar-item-active" : ""
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-lg bg-secondary p-3">
          <p className="text-xs text-muted-foreground">
            Platform by IntelArt
          </p>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  // Implementar menú móvil aquí en el futuro
  return null;
}