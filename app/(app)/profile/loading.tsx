import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <section className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 px-3 xs:px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12 pt-6 pb-20">
      {/* Main Content Column */}
      <main className="flex w-full max-w-[600px] flex-col space-y-8">
        
        {/* ShortProfile Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
            <Skeleton className="absolute bottom-0 right-0 h-8 w-8 rounded-full" />
          </div>
          <div className="flex flex-col items-center space-y-2 w-full">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-center gap-8 w-full mt-4">
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        <Skeleton className="w-full h-px" />

        {/* Tabs Skeleton */}
        <div className="flex gap-6 w-full">
          <Skeleton className="h-11 flex-1 rounded-[15px]" />
          <Skeleton className="h-11 flex-1 rounded-[15px]" />
        </div>

        {/* Horizontal Scroll Widgets Skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-40 flex-shrink-0 rounded-xl" />
          ))}
        </div>

        {/* Reorder Button Skeleton */}
        <Skeleton className="h-12 w-full sm:w-48 rounded-full" />

        {/* About Section Skeleton */}
        <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-sm sm:px-10 sm:py-9 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Skills Section Skeleton */}
        <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-sm sm:px-10 sm:py-9 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32 rounded-md ml-10" />
            </div>
          ))}
        </div>

        {/* Credits Section Skeleton */}
        <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-sm sm:px-10 sm:py-9 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Right Sidebar (Highlights) Skeleton */}
      <div className="w-full max-w-[336px] space-y-6 hidden lg:block">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  )
}
