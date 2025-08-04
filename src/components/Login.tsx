import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserStore } from '../store/userStore'
import { Pill, UserPlus, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false)
  const { login } = useUserStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      login(data.email, data.firstName, data.lastName)
      toast.success(isRegistering ? 'Account created successfully!' : 'Welcome back!')
    } catch (error) {
      toast.error('Failed to sign in. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
            <Pill className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          PrescriptionPro
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isRegistering ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                {...register('firstName')}
                className="input-field"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                {...register('lastName')}
                className="input-field"
                placeholder="Smith"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full inline-flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    {isRegistering ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isRegistering ? (
                      <UserPlus className="h-5 w-5 mr-2" />
                    ) : (
                      <LogIn className="h-5 w-5 mr-2" />
                    )}
                    {isRegistering ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                {isRegistering 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Register"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
