import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { toast } from 'sonner';
import type { UserLoginFormData } from '@/validations/AuthValidations';
import type { UserAuthApiResponse } from '@/types/AuthTypes'
import type { QueryError } from '@/types/ResponseTypes'
import { loginSchema } from '@/validations/AuthValidations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import InputField from '@/components/shared/InputField'
import RequiredLabel from '@/components/shared/RequiredLabel'
import { Checkbox } from '@/components/ui/checkbox'
import TransitionLink from '@/components/layout/TransitionLink'
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge'
import usePostRequest from '@/hooks/usePostRequests'
import { setAuthCookies } from '@/services/CookiesServices'
import CloseToast from '@/components/shared/CloseToast';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const [isPassword, setIsPassword] = useState(false)

  const { mutate: login, isPending } = usePostRequest<UserAuthApiResponse, UserLoginFormData>({
    URL: '/auth/sign-in',
    showErrorToast: true,
    onSuccess: (response) => {

      toast.success(`Welcome back !`, { action: <CloseToast />, duration: 3000 })
      // Save tokens to cookies
      setAuthCookies(response.data)
      // Navigate to dashboard
      navigate({ to: '/overview' })
    },
    onError: (error: QueryError) => {
      // Check for device verification required
      if (error.status === 403) {
        const errorData = error.response?.data as { redirect_action?: string } | undefined
        console.log(errorData, error.response)
        if (errorData?.redirect_action === 'verify_device') {
          navigate({ to: '/verify-device' })
        }
      }
    },
  })

  const onSubmit = (data: UserLoginFormData) => {
    login(data)
  }

  return (
    <Card className="w-full max-w-[600px] p-8 shadow-xl bg-card">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text relative inline-block text-primary">
          Login
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Please login to admin dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <RequiredLabel>Email</RequiredLabel>
          <InputField
            fieldName="email"
            register={register}
            error={errors.email?.message}
            placeHolderText="Admin@gmail.com"
            showPlaceholder
            type="email"
          />
        </div>

        <div className="space-y-2">
          <RequiredLabel>Password</RequiredLabel>
          <InputField
            fieldName="password"
            register={register}
            error={errors.password?.message}
            placeHolderText="Enter your password"
            showPlaceholder
            showPasswordToggle
            onPasswordToggle={() => setIsPassword((prev => !prev))}
            type={isPassword ? "text" : "password"}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" />
            <span
              className="text-sm font-medium text-muted-foreground cursor-pointer"
            >
              Remember me
            </span>
          </div>
          <TransitionLink
            to="."
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </TransitionLink>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
          disabled={isPending}
        >
          {isPending ? <LoadingIconSmall /> : 'Login'}
        </Button>
      </form>
    </Card>
  )
}
