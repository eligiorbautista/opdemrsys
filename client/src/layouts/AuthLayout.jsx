import { Outlet } from 'react-router-dom'
import { FaHeartbeat } from 'react-icons/fa'
import { Toaster } from 'sonner'

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="bottom-right" richColors />
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/1400/3c479b177195801.64d23460042c2.jpg)' }}
      />
      <div className="fixed inset-0 bg-slate-900/60 z-0" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-xl mb-4 shadow-lg">
            <FaHeartbeat className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">OPD EMR</h1>
          <p className="text-white mt-1">Out-Patient Department EMR System</p>
        </div>
        <div className="card p-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout