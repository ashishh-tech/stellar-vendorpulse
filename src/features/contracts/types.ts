export interface VendorDTO {
  id: number;
  owner: string;
  name: string;
  category: string;
  contact_email: string;
  status: 'Active' | 'Suspended' | 'Probation' | 'Deactivated';
  avg_score: number;
  review_count: number;
  created_at: number;
  updated_at: number;
}

export interface ReviewDTO {
  id: number;
  vendor_id: number;
  reviewer: string;
  delivery_score: number;
  quality_score: number;
  payment_score: number;
  communication_score: number;
  overall_score: number;
  comment: string;
  created_at: number;
}

export interface RegisterVendorInput {
  name: string;
  category: string;
  contactEmail: string;
}

export interface SubmitReviewInput {
  vendorId: number;
  deliveryScore: number;
  qualityScore: number;
  paymentScore: number;
  communicationScore: number;
  comment: string;
}
