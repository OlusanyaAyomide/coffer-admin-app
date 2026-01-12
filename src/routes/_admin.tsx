import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})

function AdminLayout() {
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
