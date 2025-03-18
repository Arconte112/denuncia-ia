import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, FileText, Phone, Settings, Home } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

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
      name: "Denuncias",
      href: "/denuncias",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Llamadas Entrantes",
      href: "/llamadas",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      name: "Configuración",
      href: "/configuracion",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className={`h-screen w-64 border-r bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 pb-6 pt-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Home className="h-6 w-6" />
          <span className="text-xl font-bold">Denuncias IA</span>
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
            Sistema de Denuncias IA v1.0
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