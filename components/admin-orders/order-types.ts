export type OrderRecord = {
  id: string;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  tiffin_id: number;
  order_date: string;
  order_status: string;
  payment_status: string;
  tiffin: {
    id: number;
    date: string;
    created_at: string;
    items: {
      id: number;
      name: string;
      description: string;
      price: number | null;
      image_url: string | null;
      created_at: string;
      is_deleted: boolean;
    }[];
  };
};

export type NextCursor = {
  lastOrderDate: string;
  lastOrderId: string;
};

export type OrdersResponse = {
  message: string;
  orders: OrderRecord[];
  nextCursor: NextCursor | null;
  hasMore: boolean;
};

export const statusTabs = [
  { key: "to-be-delivered", label: "To Be Delivered" },
  { key: "delivered", label: "Delivered" },
  { key: "rejected", label: "Rejected" },
] as const;
