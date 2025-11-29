import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileSkeleton() {
  return (
    <section className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 px-3 xs:px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12 pt-6 pb-20">
      {/* Main Content Column */}
      <main className="flex w-full max-w-[600px] flex-col space-y-4">
        
        {/* ShortProfile Skeleton */}
        <section className="relative w-full border-b border-[#DADADA] pb-6">
            {/* Banner Area */}
            <div className="relative h-[228px]">
                <Skeleton className="relative sm:h-[150px] h-[88px] w-full rounded-[20px]" />
            </div>

            {/* Profile Photo */}
            <div className="absolute inset-x-0 top-[38px] sm:top-[108px] left-[9px] sm:left-[58px] flex justify-start">
                <Skeleton className="h-[112px] w-[112px] rounded-full border-4 border-white" />
            </div>

            {/* Edit Button */}
            <div className="absolute right-4 top-[98px] sm:top-[200px]">
                <Skeleton className="h-[28px] w-[28px] rounded-full" />
            </div>

            {/* Info Row (Desktop) */}
            <div className="absolute inset-x-0 top-[160px] max-w-[367.8px] left-[200px] hidden sm:flex gap-3">
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            {/* Main Info */}
            <div className="flex sm:mt-10 -mt-10 flex-col gap-4 px-4 sm:px-[58px]">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
            </div>
        </section>

        <div className="w-full bg-slate-200 h-px sm:h-[1px] mb-5" />

        {/* Tabs Skeleton */}
        <div className="flex flex-row gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Skeleton className="flex-1 h-[44px] rounded-[12px] sm:rounded-[15px]" />
          <Skeleton className="flex-1 h-[44px] rounded-[12px] sm:rounded-[15px]" />
        </div>

        {/* Horizontal Scroll Widgets Skeleton */}
        <div className="flex flex-row overflow-hidden gap-x-4 mb-6 sm:mb-7">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px] w-[140px] flex-shrink-0 rounded-xl" />
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

      </main>

      {/* Right Sidebar (Highlights) Skeleton */}
      <div className="w-full hidden lg:block">
            <div className="hidden lg:flex gap-6">
                <aside className="sticky top-24 self-start w-full max-w-[336px] space-y-6">
                    <Skeleton className="w-full h-11 rounded-[10px]" />
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="w-[275px] h-[263px] rounded-[8px]" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Vertical Line Skeleton */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col gap-1">
                         {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} className="h-[26px] w-[26px] rounded-none" />)}
                    </div>
                    <Skeleton className="h-[500px] w-px" />
                </div>
            </div>
      </div>
    </section>
  )
}
