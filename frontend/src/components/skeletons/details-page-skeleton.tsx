import { Skeleton } from '@/components/ui/skeleton';
import CategoryPill from '@/components/category-pill';

export const DetailsPageSkeleton = () => {
  return (
    <div className="flex-grow bg-light dark:bg-dark">
      <div className="relative flex flex-col">
        <Skeleton className="h-80 w-full sm:h-96" />
        <div className="absolute left-0 top-0 h-full w-full bg-slate-950/60"></div>
        <div className="absolute bottom-6 w-full max-w-xl px-4 text-slate-50 sm:bottom-8 sm:max-w-3xl sm:px-8 lg:bottom-12 lg:max-w-5xl lg:px-12">
          <div className="mb-4 flex space-x-2">
            {[1, 2].map((idx) => (
              <Skeleton key={idx} className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
          <Skeleton className="mb-4 h-8 w-3/4 bg-slate-200 dark:bg-slate-700 sm:h-10 lg:h-12" />
          <Skeleton className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 sm:h-5" />
          <Skeleton className="mt-2 h-3 w-1/4 bg-slate-200 dark:bg-slate-700 sm:h-4" />
        </div>
      </div>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-y-4 px-4 py-10">
        <div className="w-full">
          {[1, 2, 3, 4, 5].map((idx) => (
            <Skeleton key={idx} className="mb-4 h-4 w-full bg-slate-200 dark:bg-slate-700 sm:h-5" />
          ))}
          <div className="my-6"></div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <Skeleton key={idx} className="mb-4 h-4 w-full bg-slate-200 dark:bg-slate-700 sm:h-5" />
          ))}
        </div>
      </div>
      
      {/* Comment Section Skeleton */}
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <Skeleton className="mb-6 h-8 w-1/4 bg-slate-200 dark:bg-slate-700" />
        
        <Skeleton className="mb-8 h-24 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
        
        <div className="space-y-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="mt-1 h-3 w-16 bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="mt-2 h-4 w-3/4 bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Related Blogs Skeleton */}
      <div className="container mx-auto flex flex-col space-y-2 px-4 py-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-1/4 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-6 w-1/6 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="block space-y-4 sm:hidden">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex h-fit rounded-lg border bg-slate-50 dark:border-none dark:bg-dark-card">
              <div className="flex h-fit w-full gap-2 p-3">
                <Skeleton className="w-1/3 h-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex h-full w-2/3 flex-col gap-2">
                  <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <Skeleton className="h-6 w-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:flex sm:flex-wrap sm:p-3">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
              <div className="mb-4 mr-8 mt-4 rounded-lg bg-light shadow-md dark:bg-dark-card">
                <Skeleton className="h-48 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="p-4">
                  <Skeleton className="mb-2 h-3 w-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="mb-2 h-6 w-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="mb-2 h-6 w-full bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};