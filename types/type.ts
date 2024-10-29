export type User = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Non-binary" | "Other";
  isVerified: boolean;
  profilePhotoUrl?: string;
  subscriptionTier: "Starter" | "Standard" | "Premium";
  createdAt: string;
  updatedAt: string;
};
