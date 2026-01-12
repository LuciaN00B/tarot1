import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Database, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/readings', label: 'Readings', icon: BookOpen },
  { path: '/admin/knowledge', label: 'Knowledge', icon: Database },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex">
        <aside className="w-64 bg-stone-800 min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-stone-400 text-sm mt-1">Hidden Wisdom</p>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-3 text-stone-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to App
            </Link>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </div>
  );
}
