export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {[...Array(3)].map((_, i) => (
                <section key={i}>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4"></div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}