import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from '../components/layout/Header'

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster position="bottom-right" richColors />
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} OPD EMR System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout