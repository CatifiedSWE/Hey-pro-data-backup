export default function InboxPage() {
    return (
        <main className="w-full h-full flex flex-col bg-white">

            {/* Header Skeleton */}
            <div className="shrink-0 h-20 w-full flex items-center justify-between px-6 border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200" />
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 sm:w-32 bg-gray-200 rounded-md" />
                        <div className="h-3 w-16 sm:w-20 bg-gray-100 rounded-md" />
                    </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Messaging Skeleton Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-6">
                {[...Array(8)].map((_, i) => {
                    const isLeft = i % 2 === 0;
                    // Randomize widths slightly for a natural look
                    const widthClass = i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3';

                    return (
                        <div
                            key={i}
                            className={`flex w-full ${isLeft ? 'justify-start' : 'justify-end'} animate-pulse`}
                        >
                            <div className={`flex max-w-[85%] sm:max-w-[60%] gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>

                                {/* Avatar (only visible on large screens or always, depending on pref) */}
                                <div className={`shrink-0 w-8 h-8 rounded-full bg-gray-200 ${isLeft ? 'block' : 'hidden sm:block opacity-0'}`} />

                                {/* Bubble */}
                                <div className={`
                                    flex flex-col gap-2 p-4 rounded-2xl w-full
                                    ${isLeft
                                        ? 'bg-gray-100 rounded-tl-none'
                                        : 'bg-gray-50 rounded-tr-none items-end'
                                    }
                                `}>
                                    <div className={`h-3 bg-gray-300/50 rounded-md ${widthClass}`} />
                                    <div className={`h-3 bg-gray-200/50 rounded-md w-11/12`} />
                                    {i % 3 === 0 && (
                                        <div className="h-3 bg-gray-200/50 rounded-md w-1/3" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Bar Skeleton */}
            <div className="shrink-0 p-4 sm:p-5 bg-white">
                <div className="w-full h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center px-6 justify-between animate-pulse">
                    <div className="h-3 w-40 bg-gray-200 rounded-md" />
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="w-8 h-8 rounded-full bg-gray-300" />
                    </div>
                </div>
            </div>
        </main>
    )
}