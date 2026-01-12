import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'
import { useState } from 'react'
import type { UserLoginFormData } from '@/validations/AuthValidations';
import { loginSchema } from '@/validations/AuthValidations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import InputField from '@/components/shared/InputField'
import RequiredLabel from '@/components/shared/RequiredLabel'
import { Checkbox } from '@/components/ui/checkbox'

import TransitionLink from '@/components/layout/TransitionLink'
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserLoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const [isPassword, setIsPassword] = useState(false)

  const onSubmit = async (data: UserLoginFormData) => {
    // Simulate API call
    console.log('Login attempt:', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Login successful (simulated)')

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
            placeHolderText="Admin@gamil.com"
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
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingIconSmall /> : 'Login'}
        </Button>
      </form>
    </Card>
  )
}
