export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
          >
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
