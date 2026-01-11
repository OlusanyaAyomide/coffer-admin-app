import * as yup from "yup"

import {
  validateRequiredEmail,
  validateRequiredPassword,
  validateRequiredPasswordConfirmation,
  validateRequiredString
} from "@/services/ValidationServices";

export type UserRegistrationFormData = {
  email: string;
  password: string;
  name: string;
  gender: string;
  confirm_password: string;
  date_of_birth: string;
  otp: string;
}
// Existing schema (keeping it for compatibility if used elsewhere, though it seems unused currently based on the requested changes)
export const signUpSchema: yup.ObjectSchema<UserRegistrationFormData> = yup.object({
  email: validateRequiredEmail('E-mail'),
  password: validateRequiredPassword('Password'),
  name: validateRequiredString('Name'),
  gender: validateRequiredString('Gender'),
  confirm_password: validateRequiredPasswordConfirmation('Confirm Password', 'password'),
  date_of_birth: validateRequiredString("Date of birth"),
  otp: validateRequiredString("OTP")
});
