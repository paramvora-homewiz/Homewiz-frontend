import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back to HomeWiz
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your housing journey
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <SignIn />
        </div>
      </div>
    </div>
  )
}
