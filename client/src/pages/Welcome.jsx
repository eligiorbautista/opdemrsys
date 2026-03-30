import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { FaHeartbeat, FaInfoCircle, FaQrcode } from 'react-icons/fa'

function Welcome() {
  const [currentTime, setCurrentTime] = useState(new Date())

  const servicesUrl = `${window.location.origin}/register`

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(clockInterval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header - Matches QueueDisplay styling */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FaHeartbeat className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OPD Welcome</h1>
              <p className="text-white/70 text-sm">Outpatient Department EMR System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatTime(currentTime)}</p>
            <p className="text-white/70 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      {/* Main Content - Matches QueueDisplay flex-1 p-8 structure */}
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          {/* Main Container - Matches QueueDisplay card styling */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-12">
            {/* Title Section */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <h2 className="text-4xl font-bold text-white uppercase tracking-wider">
                  Welcome to OPD
                </h2>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xl text-white/70">
                Scan the QR code below to view our services and booking guide
              </p>
            </div>

            {/* QR Code Section - Centered */}
            <div className="flex flex-col items-center gap-8">
              {/* QR Code Container */}
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <QRCode 
                  value={servicesUrl}
                  size={280}
                  level="H"
                />
              </div>

              {/* Instructions - Side by side cards like QueueDisplay stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Open Camera</h3>
                  <p className="text-white/70 text-sm">Use your smartphone camera app</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Scan Code</h3>
                  <p className="text-white/70 text-sm">Point at the QR code above</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">View Info</h3>
                  <p className="text-white/70 text-sm">Learn about our services</p>
                </div>
              </div>

              {/* Benefits Row - Like QueueDisplay footer stats */}
              <div className="flex flex-wrap gap-6 justify-center mt-4">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-400/30">
                  <FaInfoCircle className="text-xl" />
                  <span className="font-semibold">View Services</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-6 py-3 rounded-full border border-blue-400/30">
                  <FaQrcode className="text-xl" />
                  <span className="font-semibold">No App Required</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-400/30">
                  <FaHeartbeat className="text-xl" />
                  <span className="font-semibold">Book Appointment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Matches QueueDisplay stats footer styling */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 px-8 py-6">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaHeartbeat className="text-emerald-400 text-xl" />
              <span className="text-white/70 text-lg">Outpatient Department</span>
            </div>
            <p className="text-white/50 text-sm">Quality Healthcare Services</p>
          </div>
          <div className="text-center border-l border-white/10 pl-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-lg">Digital EMR System</span>
            </div>
            <p className="text-white/50 text-sm">Modern Patient Care</p>
          </div>
          <div className="text-center border-l border-white/10 pl-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaQrcode className="text-blue-400 text-xl" />
              <span className="text-white/70 text-lg">Quick Access</span>
            </div>
            <p className="text-white/50 text-sm">Scan & Go</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Welcome
