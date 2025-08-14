'use client'

import { useState } from 'react'

interface FormData {
  fullName: string
  email: string
  phone: string
  moveInDate: string
  message: string
}

export const useFormModal = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openModal = () => setIsFormModalOpen(true)
  const closeModal = () => setIsFormModalOpen(false)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Form submitted:', formData)
      closeModal()
      setFormData({ fullName: '', email: '', phone: '', moveInDate: '', message: '' })
      // You can add actual form submission logic here
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return {
    isFormModalOpen,
    formData,
    isSubmitting,
    openModal,
    closeModal,
    handleFormSubmit,
    updateFormData,
    setFormData
  }
}