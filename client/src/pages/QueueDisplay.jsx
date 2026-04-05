import { useState, useEffect } from 'react'
import { FaUser, FaClock, FaHourglass, FaHeartbeat } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function QueueDisplay() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [error, setError] = useState(null)

  useEffect(() => {
    loadQueue()
    
    // Auto-refresh every 5 seconds
    const queueInterval = setInterval(loadQueue, 5000)
    
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => {
      clearInterval(queueInterval)
      clearInterval(clockInterval)
    }
  }, [])

  const loadQueue = async () => {
    try {
      const response = await fetch(`${API_URL}/public/queue`)
      const data = await response.json()
      setQueue(data.data || [])
      setError(null)
    } catch (error) {
      console.error('Failed to load queue:', error)
      setError('Failed to load queue data')
    } finally {
      setLoading(false)
    }
  }

  // Get entries by status
  const waitingEntries = queue.filter(e => e.status === 'WAITING')
  const inProgressEntries = queue.filter(e => e.status === 'IN_PROGRESS')
  const completedEntries = queue.filter(e => e.status === 'COMPLETED')

  // Get the currently serving patient (first IN_PROGRESS)
  const nowServing = inProgressEntries[0]

  // Get next in line (first 3 waiting entries)
  const nextInLine = waitingEntries.slice(0, 4)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3:
      case 'EMERGENCY':
        return 'bg-red-500 text-white'
      case 2:
      case 'URGENT':
        return 'bg-orange-500 text-white'
      case 1:
      case 'HIGH':
        return 'bg-amber-500 text-white'
      default:
        return 'bg-emerald-500 text-white'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 3:
        return 'Emergency'
      case 2:
        return 'Urgent'
      case 1:
        return 'High'
      default:
        return 'Normal'
    }
  }

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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FaHeartbeat className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OPD Queue Display</h1>
              <p className="text-white/70 text-sm">Patient Queue Management System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatTime(currentTime)}</p>
            <p className="text-white/70 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">Loading queue...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400 text-xl mb-2">{error}</p>
              <p className="text-white/50">Please refresh the page</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Now Serving Section */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Now Serving</h2>
              </div>
              
              {nowServing ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/50">
                      <span className="text-6xl font-bold text-white">
                        {nowServing.position || '#'}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-2">
                      {nowServing.patient?.firstName} {nowServing.patient?.lastName}
                    </h3>
                    <p className="text-xl text-emerald-200 mb-4">
                      {nowServing.patient?.phone || 'No phone'}
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(nowServing.priority)}`}>
                      {getPriorityLabel(nowServing.priority)} Priority
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaHourglass className="text-white/30 text-6xl" />
                  </div>
                  <h3 className="text-3xl font-bold text-white/50">No Patient Being Served</h3>
                  <p className="text-xl text-white/30 mt-2">Waiting for next call...</p>
                </div>
              )}
            </div>

            {/* Next in Line Section */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Next in Line</h2>
              </div>
              
              {nextInLine.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {nextInLine.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-bold text-white">{entry.position || '#'}</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-white">
                            {entry.patient?.firstName} {entry.patient?.lastName}
                          </h4>
                          <p className="text-white/60 text-lg">
                            {entry.patient?.phone || 'No phone'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(entry.priority)}`}>
                          {getPriorityLabel(entry.priority)}
                        </span>
                        {index === 0 && (
                          <p className="text-emerald-400 text-sm font-medium mt-2">Next</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-white/30 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white/50">No Patients Waiting</h3>
                  <p className="text-lg text-white/30 mt-2">Queue is empty</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Stats Footer */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 px-8 py-6">
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaHourglass className="text-amber-400 text-xl" />
              <span className="text-white/70 text-lg">Waiting</span>
            </div>
            <p className="text-4xl font-bold text-white">{waitingEntries.length}</p>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-lg">In Progress</span>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{inProgressEntries.length}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaClock className="text-blue-400 text-xl" />
              <span className="text-white/70 text-lg">Completed Today</span>
            </div>
            <p className="text-4xl font-bold text-white">{completedEntries.length}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default QueueDisplay
