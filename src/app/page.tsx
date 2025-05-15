import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-primary-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary-800 mb-4">TableTap</h1>
        <p className="text-xl text-gray-600 mb-8">Digital Menu and Ordering System</p>
        
        <div className="space-y-4">
          <Link 
            href="/admin/dashboard" 
            className="block w-64 py-3 px-6 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
          >
            Restaurant Admin
          </Link>
          
          <Link 
            href="/menu" 
            className="block w-64 py-3 px-6 rounded-lg bg-secondary-600 text-white font-semibold hover:bg-secondary-700 transition"
          >
            Customer Menu Demo
          </Link>
        </div>
      </div>
    </div>
  )
}