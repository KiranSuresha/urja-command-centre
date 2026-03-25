import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectLoading() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-8 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
      </div>
      <div className="flex-1 p-8 overflow-hidden">
        <div className="flex gap-6 h-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-80 flex-shrink-0 flex flex-col gap-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="p-4 rounded-2xl border border-border/30 bg-muted/10 h-full flex flex-col gap-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
