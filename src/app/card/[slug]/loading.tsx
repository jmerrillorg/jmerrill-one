export default function Loading() {
  return (
    <div className="min-h-screen py-16 px-4 animate-pulse">
      <div className="max-w-xl mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
      <div className="max-w-xl mx-auto mt-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}