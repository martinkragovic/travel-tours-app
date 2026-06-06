export type Country = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
};

export type TourImage = {
  id: number;
  filePath: string;
  altText?: string | null;
  isMain: boolean;
  sortOrder?: number;
};

export type TourDate = {
  id: number;
  startDate: string;
  endDate: string;
  price?: number | null;
  totalSeats?: number;
  availableSeats: number;
  isAvailable?: boolean;
};

export type TourListItem = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  durationDays: number;
  minPrice: number;
  maxParticipants: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  averageRating: number;
  reviewsCount: number;
  country: Country;
  categories: Category[];
  mainImage?: TourImage | null;
  nearestDate?: TourDate | null;
};

export type ToursResponse = {
  items: TourListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TourDetails = TourListItem & {
  fullDescription: string;
  whatIncluded?: string | null;
  requirements?: string | null;
  cancellationPolicy?: string | null;
  images: TourImage[];
  dates: TourDate[];
  reviews: {
    id: number;
    authorName: string;
    rating: number;
    text: string;
    createdAt: string;
  }[];
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  roleName?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export type BookingStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'CONFIRMED'
  | 'CANCELLED';

export type AdminBookingListItem = {
  id: number;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  participants: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  tour: {
    id: number;
    title: string;
    slug: string;
  };
  tourDate: {
    id: number;
    startDate: string;
    endDate: string;
    price?: number | null;
  };
};

export type AdminBookingDetails = AdminBookingListItem & {
  customerComment?: string | null;
  adminComment?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
};

export type AdminBookingsResponse = {
  items: AdminBookingListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';

export type AdminTourListItem = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  durationDays: number;
  minPrice: number;
  maxParticipants: number;
  difficultyLevel: DifficultyLevel;
  averageRating: number;
  reviewsCount: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  country: {
    id: number;
    name: string;
    slug: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  mainImage?: {
    id: number;
    filePath: string;
    altText?: string | null;
    isMain: boolean;
  } | null;
  _count: {
    dates: number;
    bookings: number;
    images: number;
    reviews: number;
  };
};

export type AdminTourDetails = AdminTourListItem & {
  fullDescription: string;
  countryId: number;
  categoryIds: number[];
  whatIncluded?: string | null;
  requirements?: string | null;
  cancellationPolicy?: string | null;
  dates: TourDate[];
  images: TourImage[];
};

export type AdminToursResponse = {
  items: AdminTourListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminTourPayload = {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  countryId: number;
  categoryIds: number[];
  durationDays: number;
  minPrice: number;
  maxParticipants: number;
  difficultyLevel: DifficultyLevel;
  whatIncluded?: string;
  requirements?: string;
  cancellationPolicy?: string;
  isPublished: boolean;
  sortOrder: number;
};

export type AdminCountry = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tours: number;
  };
};

export type AdminCountryPayload = {
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tours: number;
  };
};

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};