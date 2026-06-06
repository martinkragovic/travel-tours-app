import type {
  AdminBookingDetails,
  AdminBookingsResponse,
  AdminCategory,
  AdminCategoryPayload,
  AdminCountry,
  AdminCountryPayload,
  AdminTourDetails,
  AdminTourPayload,
  AdminToursResponse,
  AdminUser,
  BookingStatus,
  Category,
  Country,
  LoginResponse,
  TourDetails,
  ToursResponse,
} from '@/types/api';

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || PUBLIC_API_URL;

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return INTERNAL_API_URL;
  }

  return PUBLIC_API_URL;
}

type GetToursParams = {
  search?: string;
  countrySlug?: string;
  categorySlug?: string;
  priceRange?: string;
  durationRange?: string;
  peopleRange?: string;
};

export type CreateBookingPayload = {
  tourId: number;
  tourDateId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  participants: number;
  customerComment?: string;
};

function buildQuery(params: GetToursParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export function getApiUrl() {
  return getApiBaseUrl();
}

export function getImageUrl(filePath?: string | null) {
  if (!filePath) {
    return '/placeholder-mountain.jpg';
  }

  if (filePath.startsWith('http')) {
    return filePath;
  }

  return `${PUBLIC_API_URL}${filePath}`;
}

export async function getTours(params: GetToursParams = {}) {
  const query = buildQuery(params);

  const response = await fetch(`${getApiBaseUrl()}/api/tours${query}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить туры');
  }

  return response.json() as Promise<ToursResponse>;
}

export async function getTourBySlug(slug: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/tours/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить тур');
  }

  return response.json() as Promise<TourDetails>;
}

export async function getCountries() {
  const response = await fetch(`${getApiBaseUrl()}/api/countries`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить страны');
  }

  return response.json() as Promise<Country[]>;
}

export async function getCategories() {
  const response = await fetch(`${getApiBaseUrl()}/api/categories`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить категории');
  }

  return response.json() as Promise<Category[]>;
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось создать заявку';

    throw new Error(message);
  }

  return data;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAdmin(payload: LoginPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось войти в админку';

    throw new Error(message);
  }

  return data as LoginResponse;
}

export async function getCurrentAdmin(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось получить текущего администратора');
  }

  return response.json() as Promise<AdminUser>;
}

export type GetAdminBookingsParams = {
  search?: string;
  status?: BookingStatus | '';
  page?: number;
  limit?: number;
};

function buildAdminQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export async function getAdminBookings(
  token: string,
  params: GetAdminBookingsParams = {},
) {
  const query = buildAdminQuery(params);

  const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить заявки');
  }

  return response.json() as Promise<AdminBookingsResponse>;
}

export async function getAdminBookingById(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить заявку');
  }

  return response.json() as Promise<AdminBookingDetails>;
}

export type UpdateBookingStatusPayload = {
  status: BookingStatus;
  adminComment?: string;
};

export async function updateAdminBookingStatus(
  token: string,
  id: number,
  payload: UpdateBookingStatusPayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить статус заявки';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminBooking(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить заявку';

    throw new Error(message);
  }

  return data;
}

export type GetAdminToursParams = {
  search?: string;
  countrySlug?: string;
  categorySlug?: string;
  isPublished?: string;
  page?: number;
  limit?: number;
};

export async function getAdminTours(
  token: string,
  params: GetAdminToursParams = {},
) {
  const query = buildAdminQuery(params);

  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить туры');
  }

  return response.json() as Promise<AdminToursResponse>;
}

export async function getAdminTourById(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить тур');
  }

  return response.json() as Promise<AdminTourDetails>;
}

export async function createAdminTour(token: string, payload: AdminTourPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось создать тур';

    throw new Error(message);
  }

  return data;
}

export async function updateAdminTour(
  token: string,
  id: number,
  payload: Partial<AdminTourPayload>,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить тур';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminTour(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить тур';

    throw new Error(message);
  }

  return data;
}

export type CreateTourDatePayload = {
  startDate: string;
  endDate: string;
  price?: number;
  totalSeats: number;
  availableSeats?: number;
  isAvailable?: boolean;
};

export type UpdateTourDatePayload = Partial<CreateTourDatePayload>;

export async function createAdminTourDate(
  token: string,
  tourId: number,
  payload: CreateTourDatePayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours/${tourId}/dates`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось добавить дату тура';

    throw new Error(message);
  }

  return data;
}

export async function updateAdminTourDate(
  token: string,
  id: number,
  payload: UpdateTourDatePayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tour-dates/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить дату тура';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminTourDate(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tour-dates/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить дату тура';

    throw new Error(message);
  }

  return data;
}

export type UploadTourImagesPayload = {
  images: FileList;
  altText?: string;
  isMain?: boolean;
  sortOrder?: number;
};

export async function uploadAdminTourImages(
  token: string,
  tourId: number,
  payload: UploadTourImagesPayload,
) {
  const formData = new FormData();

  Array.from(payload.images).forEach((file) => {
    formData.append('images', file);
  });

  if (payload.altText) {
    formData.append('altText', payload.altText);
  }

  if (payload.isMain !== undefined) {
    formData.append('isMain', String(payload.isMain));
  }

  if (payload.sortOrder !== undefined) {
    formData.append('sortOrder', String(payload.sortOrder));
  }

  const response = await fetch(`${getApiBaseUrl()}/api/admin/tours/${tourId}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось загрузить изображения';

    throw new Error(message);
  }

  return data;
}

export type UpdateTourImagePayload = {
  altText?: string;
  isMain?: boolean;
  sortOrder?: number;
};

export async function updateAdminTourImage(
  token: string,
  id: number,
  payload: UpdateTourImagePayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tour-images/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить изображение';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminTourImage(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/tour-images/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить изображение';

    throw new Error(message);
  }

  return data;
}

export async function getAdminCountries(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/countries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить страны');
  }

  return response.json() as Promise<AdminCountry[]>;
}

export async function createAdminCountry(
  token: string,
  payload: AdminCountryPayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/countries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось создать страну';

    throw new Error(message);
  }

  return data;
}

export async function updateAdminCountry(
  token: string,
  id: number,
  payload: Partial<AdminCountryPayload>,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/countries/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить страну';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminCountry(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/countries/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить страну';

    throw new Error(message);
  }

  return data;
}

export async function getAdminCategories(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить категории');
  }

  return response.json() as Promise<AdminCategory[]>;
}

export async function createAdminCategory(
  token: string,
  payload: AdminCategoryPayload,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/categories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось создать категорию';

    throw new Error(message);
  }

  return data;
}

export async function updateAdminCategory(
  token: string,
  id: number,
  payload: Partial<AdminCategoryPayload>,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось обновить категорию';

    throw new Error(message);
  }

  return data;
}

export async function deleteAdminCategory(token: string, id: number) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Не удалось удалить категорию';

    throw new Error(message);
  }

  return data;
}