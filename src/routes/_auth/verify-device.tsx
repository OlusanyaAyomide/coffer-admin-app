import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'
import type { UserOTPFormData } from '@/validations/AuthValidations';
import { otpSchema } from '@/validations/AuthValidations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import OTPInputField from '@/components/shared/OTPInputField'
import RequiredLabel from '@/components/shared/RequiredLabel'
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge'

export const Route = createFileRoute('/_auth/verify-device')({
  component: VerifyDevicePage,
})

function VerifyDevicePage() {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserOTPFormData>({
    resolver: yupResolver(otpSchema),
  })

  // Watch the OTP value to pass it to the OTPInputField
  const otpValue = watch('otp')

  const onSubmit = async (data: UserOTPFormData) => {
    // Simulate API call
    console.log('OTP Verification attempt:', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Device verified successfully (simulated)')
  }

  const handleResend = () => {
    toast.info("OTP Resent")
  }

  return (
    <Card className="w-full max-w-[600px] p-8 shadow-xl bg-card">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text relative inline-block text-primary">
          Verify Device
        </h2>
        <p className="text-muted-foreground mt-2 text-sm text-center">
          Please enter the OTP sent to your device to verify your identity.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center flex-col items-center gap-2">
          <RequiredLabel>Enter OTP</RequiredLabel>
          <OTPInputField
            fieldName="otp"
            value={otpValue}
            setValue={setValue}
            error={errors.otp?.message}
            maxLength={6}
          />
        </div>

        <div className="flex justify-center">
          <Button
            variant="link"
            type="button"
            className="text-sm text-primary"
            onClick={handleResend}
          >
            Resend OTP
          </Button>
        </div>


        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingIconSmall /> : 'Verify'}
        </Button>
      </form>
    </Card>
  )
}
