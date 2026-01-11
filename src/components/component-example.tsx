'use client'

import { useForm } from "react-hook-form"

import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema, UserRegistrationFormData } from "@/validations/AuthValidations";
import { Card } from "./ui/card";
import RequiredLabel from "./shared/RequiredLabel";
import InputField from "./shared/InputField";
import SelectField from "./shared/SelectField";
import DatePicker from "./shared/DatePicker";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import OTPInputField from "./shared/OTPInputField";
import useWindowProperties from "@/hooks/useWindowProperty";
import { toast } from "sonner";
import CofferLogo from "./shared/CofferLogo";
// import TextAreaInput from "./shared/TextAreaInput";


export default function SampleForm() {

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch } = useForm<UserRegistrationFormData>({
      resolver: yupResolver(signUpSchema),
    });
  const { setTheme, theme } = useTheme()

  const { isMounted } = useWindowProperties({})
  // console.log(theme, theme === 'light')
  const [gender, date_of_birth] = watch(["gender", "date_of_birth"])
  const onSubmit = (data: UserRegistrationFormData) => {
    console.log(data);
  };
  return (
    <div className="">
      <Card className="w-[500px] mx-auto overflow-auto">
        {/* <h3 className="text-primary text-2xl font-bold" >Sample Form</h3> */}
        <CofferLogo />
        <button onClick={() => toast.success('Success')}>Test</button>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <RequiredLabel>E-mail</RequiredLabel>
            <InputField
              fieldName="email"
              type="email"
              register={register}
              error={errors.email?.message}
              placeHolderText="Enter Email"
              showPlaceholder
            />
          </div>
          <div>
            <RequiredLabel>Name</RequiredLabel>
            <InputField
              fieldName="name"
              placeHolderText="Enter Name"
              register={register}
              error={errors.name?.message}
              showPlaceholder
            />
          </div>
          <div>
            <RequiredLabel>Password</RequiredLabel>
            <InputField
              fieldName="password"
              type="password"
              register={register}
              error={errors.password?.message}
              placeHolderText="Confirm Password"
              showPlaceholder
            />
          </div>
          <div>
            <RequiredLabel>Confirm Password</RequiredLabel>
            <InputField
              fieldName="confirm_password"
              register={register}
              error={errors.confirm_password?.message}
              placeHolderText="Confirm Password"
              showPlaceholder
            />
          </div>
          {/* <div>
          Text Field Sanmple
            <RequiredLabel>Description</RequiredLabel>
            <TextAreaInput
              fieldName="description"
              register={register}
              error={errors.description?.message}
              placeHolderText="Description"
              showPlaceholder
            />
          </div> */}
          <OTPInputField
            fieldName="otp"
            value={watch('otp')}
            setValue={setValue}
            error={errors.otp?.message}
            maxLength={6}
          />

          <div>
            <RequiredLabel>Gender</RequiredLabel>
            <SelectField
              fieldName="gender"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
              value={gender}
              placeHolderText="Select Gender"
              showPlaceholder
              setValue={setValue}
              error={errors.gender?.message}
            />
          </div>
          <div>
            <RequiredLabel>Date of Birth</RequiredLabel>
            <DatePicker
              selectedDate={date_of_birth}
              placeHolderText="Select Date of Birth"
              showYear
              onDateSelect={(date) => setValue("date_of_birth", date)}
              error={errors.date_of_birth?.message}
              showPlaceholder
            />
          </div>
          {
            isMounted && (
              <>
                {
                  theme === 'dark' && (
                    <Button variant="outline" className="w-[100px]" type="button" size={"sm"} onClick={() => setTheme("light")}>Light</Button>
                  )
                }
                {theme === 'light' && (
                  <Button variant="outline" className="w-[100px]" type="button" size={"sm"} onClick={() => setTheme("dark")}>Dark</Button>
                )}
              </>
            )
          }
          <Button className="flex mt-4" type="submit">Submit</Button>
        </form>
      </Card>
    </div>
  )
}
