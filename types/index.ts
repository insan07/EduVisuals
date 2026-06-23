export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'free_user' | 'premium_user' | 'team_creator' | 'moderator' | 'admin';
  subscription_status: 'free' | 'premium' | 'institution';
  subscription_expires_at: string | null;
  downloads_today: number;
  last_download_date: string | null;
  created_at: string;
}

export interface Image {
  id: string;
  title: string;
  description: string | null;
  alt_text: string | null;
  file_url: string;
  thumbnail_url: string;
  watermarked_url: string | null;
  svg_url: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  is_premium: boolean;
  is_published: boolean;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_by: string;
  approved_by: string | null;
  download_count: number;
  view_count: number;
  created_at: string;
  published_at: string | null;
}

export interface ImageTag {
  id: string;
  image_id: string;
  tag: string;
  tag_type: 'subject' | 'grade' | 'type' | 'syllabus' | 'medium' | 'topic' | 'custom';
}

export interface Download {
  id: string;
  user_id: string;
  image_id: string;
  download_type: 'free_watermarked' | 'premium_hd' | 'premium_svg';
  ip_address: string | null;
  created_at: string;
}

export interface SavedCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  item_ids?: string[]; // helper client side
}

export interface SavedItem {
  id: string;
  collection_id: string;
  image_id: string;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'team_creator' | 'moderator';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'student_monthly' | 'student_yearly' | 'institution_monthly';
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  payhere_subscription_id: string | null;
  amount_lkr: number;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'team_creator' | 'moderator';
  joined_at: string;
  upload_count: number;
  is_active: boolean;
}
