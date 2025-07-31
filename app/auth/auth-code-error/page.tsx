import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">!</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            There was an error with your authentication
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30 text-center transition-colors duration-300">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors">
            We couldn't verify your authentication. This could be due to an expired or invalid link.
          </p>
          
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
            Need help?{' '}
            <Link href="/signup" className="font-semibold text-purple-600 hover:text-purple-800 transition-colors duration-200">
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 