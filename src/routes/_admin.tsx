import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { getAccessToken } from '@/services/CookiesServices'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Only check auth on client after hydration
    const accessToken = getAccessToken()
    if (!accessToken) {
      navigate({ to: '/login' })
    } else {
      setIsChecking(false)
    }
  }, [navigate])

  // Show nothing while checking auth (same on server and client initially)
  if (isChecking) {
    return null
  }

  return (
    <div className="flex w-full justify-center bg-background">
      <SidebarProvider>
        <div className="flex max-w-[1600px] w-full border-x shadow-sm min-h-screen">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-4">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
