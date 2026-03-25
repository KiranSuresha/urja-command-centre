'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Sun, Users, Settings, Bell, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/huddle', label: 'Daily Huddle', icon: Sun },
  { href: '/team', label: 'Team', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-[260px] shrink-0 border-r border-border/50 bg-background/95 backdrop-blur-3xl flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.015)] z-20">
      
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border/40 flex items-center gap-3">
        <div className="relative size-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-border bg-gradient-to-tr from-background to-muted/20">
          <Image src="/logo.png" alt="URJA" fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-foreground leading-tight">URJA</span>
          <span className="text-[10px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase mt-0.5">Command Centre</span>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-4">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground/80 bg-muted/40 hover:bg-muted/80 hover:text-foreground rounded-lg border border-border/50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] group">
          <Search size={15} className="group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium">Quick search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-[4px] border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground/50 tracking-widest mb-3 uppercase">Workspace</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
              )}
              <Icon size={16} className={cn(
                "transition-transform duration-200 group-hover:scale-110", 
                 isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground/80"
              )} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="px-3 pb-4">
        <div className="space-y-1 pt-4 border-t border-border/40">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors group">
            <Bell size={16} className="text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors group">
            <Settings size={16} className="text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all" />
            Settings
          </button>
        </div>
        
        {/* User Profile Hook */}
        <div className="mt-4 p-3 rounded-xl bg-accent/30 hover:bg-accent/60 transition-colors border border-border/40 flex items-center gap-3 flex-row cursor-pointer shadow-xs">
          <div className="size-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 shadow-inner shrink-0 ring-2 ring-background" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">Kiran Suresha</span>
            <span className="text-[10px] text-muted-foreground truncate font-medium">B V G URJA Team</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
