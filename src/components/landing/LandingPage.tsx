'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Clock, Shield, Star, ArrowRight, Upload, CheckCircle, MessageSquare, Building, Lightbulb, Play, Users, BarChart } from 'lucide-react'
import { useFormModal } from '@/hooks/useFormModal'
import Link from 'next/link'

export function LandingPage() {
  const { openModal } = useFormModal()
  const features = [
    {
      icon: Clock,
      title: "Lightning Fast Onboarding",
      description: "Complete your application in under 5 minutes with our smart form technology"
    },
    {
      icon: Upload,
      title: "Easy Document Upload",
      description: "Drag & drop your documents with automatic compression and organization"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level security ensures your personal information stays protected"
    },
    {
      icon: CheckCircle,
      title: "Instant Approval",
      description: "Get approved faster with our AI-powered application processing"
    }
  ]

  const steps = [
    { number: "01", title: "Sign Up", description: "Create your account in seconds" },
    { number: "02", title: "Complete Profile", description: "Fill out your information with smart suggestions" },
    { number: "03", title: "Upload Documents", description: "Drag and drop your required documents" },
    { number: "04", title: "Get Approved", description: "Receive instant feedback on your application" }
  ]

  const demoFlow = [
    {
      icon: Building,
      title: "Explore Properties",
      description: "Browse available rooms and buildings with advanced filters",
      link: "/explore",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Ask questions and get instant insights about properties",
      link: "/chat",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Management Forms",
      description: "Experience smart forms with auto-fill and validation",
      link: "/forms",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "View real-time metrics and performance insights",
      link: "/admin/data-management",
      color: "from-orange-500 to-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="flex items-center space-x-3">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HomeWiz
                </span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight px-4"
            >
              Find Your Perfect Home
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-pulse">
                In Minutes, Not Days
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Skip the paperwork hassle. Our intelligent application system gets you approved faster
              with minimal typing and maximum convenience.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <Link href="/explore">
                <Button size="xl" variant="professional" className="group shadow-xl hover:shadow-2xl">
                  Explore Properties
                  <Building className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="xl" variant="professional" className="group shadow-xl hover:shadow-2xl">
                  Chat with AI Assistant
                  <MessageSquare className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/forms">
                <Button size="xl" variant="outline" className="shadow-lg hover:shadow-xl">
                  Try Demo Forms
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HomeWiz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've reimagined the rental application process to be faster, easier, and more secure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-gray-200/60">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50/50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get approved in 4 simple steps. No complicated forms, no endless waiting.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-xl font-bold mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Guide Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Play className="w-4 h-4" />
              Interactive Demo
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience HomeWiz in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take a guided tour through our platform's key features and see how easy property management can be.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoFlow.map((demo, index) => (
              <motion.div
                key={demo.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={demo.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-gray-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-r ${demo.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <demo.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-400">Step {index + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {demo.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {demo.description}
                      </p>
                      <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        Start Tour
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Tips Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Lightbulb className="w-4 h-4" />
                Pro Tips for Your Demo
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Make the Most of Your Experience
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Start with Property Explorer
                  </h3>
                  <p className="text-gray-600">
                    Get a feel for the platform by browsing available properties. Use filters to narrow down your search and see detailed property information.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Try the AI Assistant
                  </h3>
                  <p className="text-gray-600">
                    Ask natural language questions like "Show me rooms under $1200" or "What's the occupancy rate?" to see intelligent responses.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Experience Smart Forms
                  </h3>
                  <p className="text-gray-600">
                    Fill out a building or room form to see auto-suggestions, smart defaults, and real-time validation in action.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of happy renters who found their perfect home with HomeWiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                variant="secondary"
                className="group shadow-xl hover:shadow-2xl bg-white/90 backdrop-blur-sm"
                onClick={openModal}
              >
                Try Demo Application
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/forms">
                <Button
                  size="xl"
                  variant="outline"
                  className="group shadow-xl hover:shadow-2xl bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                >
                  Start with Forms
                  <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
