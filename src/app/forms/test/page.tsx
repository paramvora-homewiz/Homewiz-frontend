import FormsTestSuite from '@/components/forms/FormsTestSuite'
import FormHeader from '@/components/ui/FormHeader'

export default function FormsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Forms Test Suite"
        subtitle="Comprehensive validation testing for all form components"
      />
      <FormsTestSuite />
    </div>
  )
}

export const metadata = {
  title: 'Forms Test Suite | HomeWiz',
  description: 'Comprehensive validation testing for all form components',
}
