export type MenuItemRecord = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MenuItemPayload = {
  name: string;
  description: string;
  price: number | null;
  image_url?: string | null;
};
