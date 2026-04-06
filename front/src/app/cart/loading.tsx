export default function CartLoading() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
