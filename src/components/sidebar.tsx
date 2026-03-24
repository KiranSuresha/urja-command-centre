'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Sun, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/huddle', label: 'Daily Huddle', icon: Sun },
  { href: '/team', label: 'Team', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 border-r border-border flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <span className="font-bold text-lg tracking-tight">URJA</span>
        <p className="text-xs text-muted-foreground mt-0.5">Command Centre</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href || (href !== '/' && pathname.startsWith(href))
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">BVG URJA Team</p>
      </div>
    </aside>
  )
}
