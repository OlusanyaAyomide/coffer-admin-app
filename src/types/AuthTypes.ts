export type AuthTokenData = {
  access_token: string;
  access_token_expiry: number;  // in seconds
  refresh_token: string;
  refresh_token_expiry: number; // in seconds
};



export type UserWorkSpaceApps = {
  id: string;
  name: string;
}

export type UserData = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type UserAuthResponse = {
  token: AuthTokenData;
  user: UserData;
};

export type UserAuthApiResponse = {
  success: boolean;
  data: UserAuthResponse;
};

export type SignUpResponse = {
  data: {
    message: string;
    registration_token: string;
    registration_token_expiry: string;
  }
};

export type VerifyEmailRequest = {
  registration_token: string;
  verification_code: string;
};

// Invitation types
export type VerifyInvitationResponse = {
  success: boolean;
  data: {
    email: string;
    workspace_name: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    workspace_id: string
  };
};

export type AcceptInvitationPayload = {
  invite_token: string;
  password: string;
};

