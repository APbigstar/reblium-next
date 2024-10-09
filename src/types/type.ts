export interface Avatar {
  id: number;
  name: string;
  image: string;
  avatar: string;
  user_id: number;
  slider_value: string;
  prompt: string;
  submission_time: string;
}

export interface AvatarCardProps {
  avatar: Avatar;
  onSetProfileAvatar: (avatarImage: string) => Promise<void>;
}

export interface User {
  id: number;
  email: string;
  name: string;
  is_verified: boolean;
  profile_picture: string;
  google_id: string | null;
  facebook_id: string | null;
  apple_id: string | null;
  discord_id: string | null;
  created_at: string | null;
  bio: string | null;
  password: string;
  verification_code: string;
  verification_code_expires: string;
}

export interface UserCredit {
  amount: number;
}

export interface UserPlan {
  plan_id: number;
  id: number;
  created_at: string;
}
