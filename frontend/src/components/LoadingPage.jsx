export default function LoadingPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center font-sans">
      <p className="text-lg mb-4">Loading please wait</p>
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}
