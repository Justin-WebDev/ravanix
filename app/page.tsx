import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white'>
      {/* Navigation */}
      <nav className='flex items-center justify-between px-6 py-4 lg:px-12'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>📊</span>
          </div>
          <span className='text-xl font-bold'>DetailFlow</span>
        </div>

        <div className='hidden lg:flex items-center space-x-8'>
          <Link
            href='#'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Home
          </Link>
          <Link
            href='#'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Features
          </Link>
          <Link
            href='#'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Pricing
          </Link>
          <Link
            href='#'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Industries
          </Link>
          <Link
            href='#'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Resources
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          <SignedOut>
            <SignInButton>
              <button className='hidden lg:block px-6 py-2 text-purple-400 hover:text-white border border-purple-400 hover:border-white rounded-lg transition-colors cursor-pointer'>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer'>
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='container mx-auto px-6 lg:px-12 pt-12 lg:pt-20'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-8'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-4 text-purple-400'>
                <div className='w-12 h-0.5 bg-purple-400'></div>
                <span className='text-sm uppercase tracking-wider'>
                  All-in-One Business Platform
                </span>
              </div>

              <h1 className='text-5xl lg:text-7xl font-bold leading-tight'>
                Meet{' '}
                <span className='text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text'>
                  DetailFlow
                </span>
                ,<br />
                Your Business
                <br />
                <span className='text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text'>
                  Navigator
                </span>
              </h1>

              <p className='text-xl text-gray-300 max-w-lg leading-relaxed'>
                DetailFlow empowers auto detailing businesses with smart
                scheduling, automated workflows, and growth tools. Scale your
                operations with AI-powered insights.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <button className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 space-x-2'>
                <span>Start Free Trial</span>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </button>
              <button className='inline-flex items-center px-8 py-4 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white font-semibold rounded-xl transition-all space-x-2'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01'
                  />
                </svg>
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Content - Dashboard Illustration */}
          <div className='relative'>
            <div className='relative w-full h-96 lg:h-[500px]'>
              {/* Dashboard Mockup */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative w-80 h-80 lg:w-96 lg:h-96'>
                  {/* Main dashboard container */}
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl backdrop-blur-sm border border-purple-400/30 p-6'>
                    {/* Dashboard header */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 bg-purple-400 rounded-full'></div>
                        <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                        <div className='w-3 h-3 bg-gray-400 rounded-full'></div>
                      </div>
                      <div className='w-16 h-2 bg-purple-400/50 rounded'></div>
                    </div>

                    {/* Dashboard content */}
                    <div className='space-y-3'>
                      <div className='h-8 bg-purple-400/30 rounded-lg'></div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='h-16 bg-blue-400/20 rounded-lg flex items-center justify-center'>
                          <svg
                            className='w-6 h-6 text-blue-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                            />
                          </svg>
                        </div>
                        <div className='h-16 bg-purple-400/20 rounded-lg flex items-center justify-center'>
                          <svg
                            className='w-6 h-6 text-purple-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='h-3 bg-gray-400/30 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-400/30 rounded w-1/2'></div>
                        <div className='h-3 bg-gray-400/30 rounded w-2/3'></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating notification cards */}
                  <div className='absolute -top-4 -right-4 bg-purple-600/90 backdrop-blur-sm border border-purple-400/50 rounded-lg p-3 text-xs'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                      <span>New booking</span>
                    </div>
                  </div>

                  <div className='absolute -bottom-4 -left-4 bg-blue-600/90 backdrop-blur-sm border border-blue-400/50 rounded-lg p-3 text-xs'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
                      <span>Payment received</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className='mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='text-center space-y-2'>
            <div className='text-3xl lg:text-4xl font-bold text-purple-400'>
              10k+
            </div>
            <div className='text-gray-400 text-sm'>Active Businesses</div>
          </div>

          <div className='text-center space-y-2'>
            <div className='text-3xl lg:text-4xl font-bold text-blue-400'>
              2M+
            </div>
            <div className='text-gray-400 text-sm'>Jobs Managed</div>
          </div>

          <div className='text-center space-y-2'>
            <div className='text-3xl lg:text-4xl font-bold text-purple-400'>
              40%
            </div>
            <div className='text-gray-400 text-sm'>Revenue Increase</div>
          </div>

          <div className='text-center space-y-2'>
            <div className='text-3xl lg:text-4xl font-bold text-blue-400'>
              99.9%
            </div>
            <div className='text-gray-400 text-sm'>Uptime</div>
          </div>
        </div>

        {/* Customer avatars */}
        <div className='mt-12 flex items-center justify-center space-x-4'>
          <div className='flex -space-x-2'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full border-2 border-gray-800'></div>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-gray-800'></div>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-2 border-gray-800'></div>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-gray-800'></div>
          </div>
          <div className='text-sm text-gray-400'>
            Trusted by{' '}
            <span className='text-purple-400 font-semibold'>10,000+</span>{' '}
            detailing businesses
          </div>
        </div>
      </div>
    </div>
  );
}
