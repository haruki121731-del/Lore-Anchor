import { Shield, Radar, List, Upload } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ViewState } from '@/types';

const navItems: { id: ViewState; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'IP登録', icon: Upload },
  { id: 'results', label: '侵害検知', icon: List },
  { id: 'monitor', label: '自動監視', icon: Radar },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentView, setCurrentView, user, infringements } = useAppStore();
  
  const pendingCount = infringements.filter(i => i.status === 'pending').length;
  
  return (
    <div className="min-h-screen bg-paper noise">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-ink">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ink flex items-center justify-center">
                <Shield className="w-5 h-5 text-paper" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter leading-none">
                  Lore-Anchor
                </h1>
                <p className="text-micro text-ink-faded">IP PROTECTION</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const showBadge = item.id === 'results' && pendingCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      relative px-4 py-2 flex items-center gap-2 font-bold tracking-tight transition-all duration-200
                      ${isActive 
                        ? 'bg-ink text-paper' 
                        : 'text-ink-faded hover:text-ink hover:bg-paper-aged'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* User */}
            <div className="flex items-center gap-4">
              {user?.plan === 'pro' && (
                <span className="badge-pro">PRO</span>
              )}
              <div className="hidden sm:block text-right">
                <p className="font-bold tracking-tight leading-none">{user?.name}</p>
                <p className="text-micro text-ink-faded">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-ink-faded flex items-center justify-center text-paper font-bold">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper border-t-2 border-ink">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === 'results' && pendingCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`
                  flex-1 py-3 flex flex-col items-center gap-1 transition-all duration-200
                  ${isActive 
                    ? 'bg-ink text-paper' 
                    : 'text-ink-faded'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta text-white text-[10px] font-bold flex items-center justify-center rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
