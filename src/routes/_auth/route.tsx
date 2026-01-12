import { Outlet, createFileRoute } from '@tanstack/react-router'
import CofferLogo from '@/components/shared/CofferLogo'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 font-sans">
      {/* Top Purple Header Section */}
      {/* Top Purple Header Section */}
      <div
        className="relative h-[300px] sm:h-[400px] w-full bg-primary flex flex-col items-center justify-center text-primary-foreground overflow-hidden"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
      >
        {/* Background decoration/particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-3 h-3 rounded-full bg-white/20 animate-pulse" />
          <div className="absolute top-[20%] right-[15%] w-4 h-4 rounded-full bg-white/10 animate-bounce delay-1000" />
          <div className="absolute bottom-[30%] left-[20%] w-2.5 h-2.5 rounded-full bg-white/30 animate-ping duration-3000" />
          <div className="absolute top-[40%] right-[30%] w-2 h-2 rounded-full bg-white/20 animate-pulse delay-700" />
          <div className="absolute top-[15%] left-[40%] w-3.5 h-3.5 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-3 h-3 rounded-full bg-white/15 animate-bounce delay-500" />

          {/* Larger subtle blurry blobs for bokeh effect */}
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="flex flex-col items-center gap-6 z-10 -mt-30">
          <CofferLogo className="text-white" size={50} />
        </div>
      </div>

      {/* Main Content Content (Overlapping) */}
      <div className="relative z-20 -mt-54 w-full flex justify-center px-4 pb-12">
        <Outlet />
      </div>
    </div>
  )
}
