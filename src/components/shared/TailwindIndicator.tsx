export default function TailwindIndicator() {
  if (process.env.VITE_API_NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex h-6 w-6 2xl:h-8 2xl:w-8 3xl:w-16 3xl:h-16  items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block 3xl:hidden">2xl</div>
      <div className="hidden 3xl:block text-2xl">3xl</div>
    </div>
  );
}
