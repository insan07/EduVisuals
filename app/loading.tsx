export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-surface text-brand">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-white border-b border-brand-border w-full fixed top-0 left-0 z-50 animate-pulse flex items-center px-6">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full mt-16">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm animate-pulse flex flex-col h-64">
              <div className="h-3/5 bg-gray-200 w-full"></div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-200 w-12 rounded"></div>
                  <div className="h-4 bg-gray-200 w-12 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
