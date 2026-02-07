'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to send message')

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-lime-500/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-[120px]" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Get in
              <br />
              <span className="bg-linear-to-r from-lime-400 via-emerald-400 to-lime-500 bg-clip-text text-transparent">
                Touch With Us
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Have questions about our programs? Want to partner with us? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-slate-900/50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ContactInfoCard
              icon={<Mail className="w-6 h-6" />}
              title="Email Us"
              content="info@ai4sid.academy"
              subContent="We'll respond within 24 hours"
              href="mailto:info@ai4sid.academy"
              color="lime"
            />
            <ContactInfoCard
              icon={<Phone className="w-6 h-6" />}
              title="Call Us"
              content="+234 (0) 123 4567"
              subContent="Mon-Fri, 9am-5pm WAT"
              href="tel:+2341234567"
              color="emerald"
            />
            <ContactInfoCard
              icon={<MapPin className="w-6 h-6" />}
              title="Visit Us"
              content="Abuja, Nigeria"
              subContent="By appointment only"
              href="https://maps.google.com"
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Send us a Message</h2>
                  <p className="text-gray-400">Fill out the form below and we'll get back to you soon.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                        placeholder="+234 123 456 7890"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="programs">Program Information</option>
                      <option value="admissions">Admissions</option>
                      <option value="partnerships">Partnerships</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Success/Error Messages */}
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-400">
                        Message sent successfully! We'll get back to you soon.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-linear-to-r from-lime-400 to-emerald-500 text-slate-900 rounded-xl font-semibold hover:from-lime-500 hover:to-emerald-600 transition-all shadow-lg shadow-lime-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Office Hours */}
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-lime-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-lime-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Office Hours</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Monday - Friday</span>
                    <span className="text-white font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Weekends</span>
                    <span className="text-gray-600">Closed</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                    * All times are in West Africa Time (WAT)
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Our Locations</h3>
                </div>
                <div className="space-y-4">
                  <LocationItem
                    city="Abuja"
                    country="Nigeria"
                    address="Gudu, FCT"
                    isHQ
                  />

                    <LocationItem
                    city="Lagos"
                    country="Nigeria"
                    address="Yaba, Lagos State"
                  />
                  <LocationItem
                    city="Nairobi"
                    country="Kenya"
                    address="Westlands, Nairobi"
                  />
                  <LocationItem
                    city="Accra"
                    country="Ghana"
                    address="East Legon, Accra"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-slate-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Follow Us</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Stay connected and get the latest updates
                </p>
                <div className="flex gap-3">
                  <SocialButton icon={<Facebook />} href="https://facebook.com" />
                  <SocialButton icon={<Twitter />} href="https://twitter.com" />
                  <SocialButton icon={<Linkedin />} href="https://linkedin.com" />
                  <SocialButton icon={<Instagram />} href="https://instagram.com" />
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-linear-to-br from-lime-500/10 to-emerald-500/10 border border-lime-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  For urgent inquiries, reach out directly via WhatsApp
                </p>
                <a
                  href="https://wa.me/2341234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500 text-slate-900 rounded-lg font-semibold hover:bg-lime-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="py-20 bg-slate-900/50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-900 border border-gray-800 rounded-2xl overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7292891796844!2d3.3792057!3d6.430082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNDguMyJOIDPCsDIyJzQ1LjEiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Components
function ContactInfoCard({ icon, title, content, subContent, href, color }: any) {
  const colors = {
    lime: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="block bg-slate-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group"
    >
      <div className={`inline-flex p-3 rounded-lg ${colors[color as keyof typeof colors]} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-white font-medium mb-1">{content}</p>
      <p className="text-sm text-gray-500">{subContent}</p>
    </a>
  )
}

function LocationItem({ city, country, address, isHQ }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
      <MapPin className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white">{city}, {country}</p>
          {isHQ && (
            <span className="px-2 py-0.5 bg-lime-500/10 text-lime-400 text-xs font-medium rounded">
              HQ
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{address}</p>
      </div>
    </div>
  )
}

function SocialButton({ icon, href }: any) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-lime-500/10 text-gray-400 hover:text-lime-400 rounded-lg transition-all"
    >
      {icon}
    </a>
  )
}