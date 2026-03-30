import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FaHeartbeat, 
  FaUserMd, 
  FaClipboardList, 
  FaPills, 
  FaMobileAlt,
  FaCalendarCheck,
  FaPhoneAlt,
  FaArrowRight,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaQrcode
} from 'react-icons/fa'

function ServiceGuide() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('services')

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(clockInterval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', { 
      hour: '2-digit', 
      minute: '2-digit'
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

  const services = [
    {
      icon: FaUserMd,
      title: 'Medical Consultations',
      description: 'Consult with our experienced doctors for diagnosis and treatment plans',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: FaClipboardList,
      title: 'Patient Registration',
      description: 'Quick and easy patient onboarding with digital records management',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FaHeartbeat,
      title: 'Health Monitoring',
      description: 'Track vital signs and health metrics with our nursing staff',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: FaPills,
      title: 'Prescription Management',
      description: 'Digital prescriptions and medication tracking for better care',
      color: 'from-amber-500 to-amber-600'
    }
  ]

  const bookingSteps = [
    {
      step: 1,
      icon: FaMobileAlt,
      title: 'Access the System',
      description: 'Click the "Get Started" button below or navigate to our login page on your mobile device or computer'
    },
    {
      step: 2,
      icon: FaCalendarCheck,
      title: 'Login or Register',
      description: 'Create an account or login if you already have one. Select your role (Doctor, Nurse, or Patient)'
    },
    {
      step: 3,
      icon: FaUserMd,
      title: 'Book an Appointment',
      description: 'Navigate to the Queue section and add yourself to the waiting list or schedule a consultation'
    },
    {
      step: 4,
      icon: FaCheckCircle,
      title: 'Receive Confirmation',
      description: 'Get your queue number and wait for your turn. You\'ll be notified when the doctor is ready'
    }
  ]

  const contactInfo = {
    phone: '(02) 8123-4567',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    location: 'Outpatient Department, Main Building'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FaHeartbeat className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">OPD Services</h1>
              <p className="text-white/70 text-base">Outpatient Department EMR System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatTime(currentTime)}</p>
            <p className="text-white/70 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-2 font-semibold text-lg border-b-2 transition-all ${
                activeTab === 'services' 
                  ? 'text-emerald-400 border-emerald-400' 
                  : 'text-white/60 border-transparent hover:text-white'
              }`}
            >
              Our Services
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-4 px-2 font-semibold text-lg border-b-2 transition-all ${
                activeTab === 'guide' 
                  ? 'text-emerald-400 border-emerald-400' 
                  : 'text-white/60 border-transparent hover:text-white'
              }`}
            >
              How to Book
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Services & Booking Guide
            </h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto mb-6">
              Welcome to our Outpatient Department. Browse our services below and follow our 
              simple guide to book your appointment.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-lg"
              >
                <FaCalendarCheck className="text-xl" />
                Register & Join Queue
                <FaExternalLinkAlt className="text-sm" />
              </Link>
              <Link 
                to="/welcome"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                <FaQrcode className="text-xl" />
                View QR Code
              </Link>
            </div>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Services We Offer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <service.icon className="text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {service.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features Highlight */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 p-6 text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
                  <p className="text-white/70">Digital Records Access</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl border border-blue-400/30 p-6 text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
                  <p className="text-white/70">Paperless System</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-md rounded-2xl border border-amber-400/30 p-6 text-center">
                  <div className="text-4xl font-bold text-amber-400 mb-2">Fast</div>
                  <p className="text-white/70">Queue Management</p>
                </div>
              </div>
            </div>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                How to Book an Appointment
              </h2>
              <div className="space-y-6">
                {bookingSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex items-start gap-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className="text-emerald-400 text-xl" />
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="text-white/70 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    {index < bookingSteps.length - 1 && (
                      <div className="hidden md:flex items-center">
                        <FaArrowRight className="text-white/30 text-2xl" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCalendarCheck className="text-blue-400" />
                  Quick Tips
                </h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Arrive 15 minutes before your scheduled appointment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Bring your ID and any previous medical records</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span>Check your queue status on the display screen in the waiting area</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span>For emergencies, please proceed directly to the Emergency Department</span>
                  </li>
                </ul>
              </div>

              {/* Call to Action */}
              <div className="mt-8 text-center">
                <Link 
                  to="/register"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-lg"
                >
                  <FaCalendarCheck className="text-xl" />
                  Ready to Book? Register Now
                  <FaExternalLinkAlt className="text-sm" />
                </Link>
                <p className="text-white/50 mt-3 text-sm">
                  No login required - Quick self-service registration
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FaPhoneAlt className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Contact Us</p>
                <p className="text-white font-semibold">{contactInfo.phone}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-sm mb-1">Operating Hours</p>
              <p className="text-white font-semibold">{contactInfo.hours}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/50 text-sm mb-1">Location</p>
              <p className="text-white font-semibold">{contactInfo.location}</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              © 2026 OPD EMR System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ServiceGuide
