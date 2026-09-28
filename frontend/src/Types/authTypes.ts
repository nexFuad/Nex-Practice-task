export type SignedInUser = {
  id: string;
  employeeId: string;
  fullName: string;
  company: string;
  email: string | null;
  role: string;
  profileImageUrl: string | null;
  passwordChangedAt: string;
};



export type LoginPayload = {
  employeeId: string;
  company: string;
  password: string;
  rememberMe: boolean;
};

export type AuthResponse = { user: SignedInUser; dashboardPath: string };

export type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
