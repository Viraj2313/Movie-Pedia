const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

const Pulse = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const MovieCardSkeleton = ({ count = 12 }) => (
    <div className="max-w-7xl mx-auto">
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 list-none">
            {[...Array(count)].map((_, i) => (
                <li
                    key={i}
                    className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg"
                >
                    <div className="relative overflow-hidden aspect-[2/3]">
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <Shimmer />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                        <Pulse className="h-5 w-3/4" />
                        <Pulse className="h-3 w-1/3" />
                        <Pulse className="h-8 w-full rounded-lg" />
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

export const MovieDetailSkeleton = () => (
    <div className="max-w-5xl mx-auto px-4 py-8">
        <Pulse className="h-10 w-64 mx-auto mb-8 rounded-lg" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="flex justify-center md:col-span-1">
                    <div className="w-full max-w-[280px] aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Pulse key={i} className="h-8 w-20 rounded-full" />
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                        <Pulse className="h-4 w-32" />
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <Pulse key={i} className="h-8 w-24 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-4 w-3/4" />
                    </div>
                    <Pulse className="h-10 w-32 rounded-xl" />
                </div>
            </div>
            <div className="px-6 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    {[...Array(7)].map((_, i) => (
                        <Pulse key={i} className="h-12 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto pt-8">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
            <Pulse className="h-8 w-48 mx-auto mb-2" />
            <Pulse className="h-4 w-32 mx-auto mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="space-y-2">
                                <Pulse className="h-6 w-12" />
                                <Pulse className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {[...Array(2)].map((_, i) => (
                    <Pulse key={i} className="h-16 rounded-xl" />
                ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 space-y-4">
                <Pulse className="h-6 w-40" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <Pulse className="h-4 w-3/4" />
                            <Pulse className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
                <Pulse className="h-6 w-40" />
                {[...Array(3)].map((_, i) => (
                    <Pulse key={i} className="h-16 rounded-xl" />
                ))}
            </div>
        </div>
    </div>
);

export const DiaryEntrySkeleton = ({ count = 5 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Pulse className="h-5 w-48" />
                        <Pulse className="h-4 w-32" />
                        <Pulse className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const FriendsPageSkeleton = () => (
    <div className="min-h-screen p-4 md:p-6">
        <Pulse className="h-10 w-48 mx-auto mb-8 rounded-lg" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, col) => (
                <div key={col} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Pulse className="w-5 h-5 rounded" />
                        <Pulse className="h-6 w-32" />
                    </div>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            <Pulse className="h-4 flex-1" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const HomeSkeleton = () => (
    <div className="min-h-screen dark:text-gray-100 dark:bg-gray-900">
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
            <div className="relative px-4 py-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <Pulse className="h-14 w-72 mx-auto mb-4 rounded-lg" />
                    <Pulse className="h-5 w-96 max-w-full mx-auto mb-8 rounded" />
                    <Pulse className="h-14 w-full max-w-2xl mx-auto rounded-2xl" />
                </div>
            </div>
        </div>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
            <MovieCardSkeleton />
        </div>
    </div>
);
