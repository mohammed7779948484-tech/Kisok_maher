export type AdminEntityID = number | string

export interface AdminMediaDTO {
  alt: string | null
  filename: string | null
  id: AdminEntityID
  url: string | null
}

export interface DashboardMetricDTO {
  description: string
  label: string
  value: number
}

export interface RecentOrderDTO {
  createdAt: string
  id: AdminEntityID
  itemCount: number
  orderNumber: string
  status: string
}

export interface InventoryAlertDTO {
  id: AdminEntityID
  productName: string
  sku: string
  stockQuantity: number
  variantName: string
}

export interface DashboardDTO {
  inventoryAlerts: InventoryAlertDTO[]
  metrics: DashboardMetricDTO[]
  recentOrders: RecentOrderDTO[]
}

export interface ProductVariantDTO {
  id: AdminEntityID
  image: AdminMediaDTO | null
  isActive: boolean
  name: string
  optionValue: string
  price: number | null
  sku: string
  sortOrder: number
  stockQuantity: number
}

export interface ProductListItemDTO {
  brand: { id: AdminEntityID; name: string } | null
  categories: Array<{ id: AdminEntityID; name: string }>
  id: AdminEntityID
  image: AdminMediaDTO | null
  isActive: boolean
  name: string
  totalStock: number
  variants: ProductVariantDTO[]
}

export interface ProductFilterOptionDTO {
  id: AdminEntityID
  name: string
}

export interface ProductsListDTO {
  brands: ProductFilterOptionDTO[]
  categories: ProductFilterOptionDTO[]
  canReadVariantPrice: boolean
  docs: ProductListItemDTO[]
  filters: {
    brand: string
    category: string
    page: number
    search: string
    sort: string
    status: string
    stock: string
  }
  hasCreatePermission: boolean
  hasDeletePermission: boolean
  hasUpdatePermission: boolean
  hasVariantCreatePermission: boolean
  hasVariantDeletePermission: boolean
  hasVariantUpdatePermission: boolean
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  media: AdminMediaDTO[]
  totalDocs: number
  totalPages: number
}

export interface CatalogBrandDTO {
  description: string | null
  id: AdminEntityID
  image: AdminMediaDTO | null
  isActive: boolean
  name: string
  sortOrder: number
}

export interface CatalogCategoryDTO {
  id: AdminEntityID
  image: AdminMediaDTO | null
  isActive: boolean
  name: string
  parent: { id: AdminEntityID; name: string } | null
  sortOrder: number
}

export interface CatalogDTO {
  brands: CatalogBrandDTO[]
  permissions: {
    brands: CatalogEntityPermissionsDTO
    categories: CatalogEntityPermissionsDTO
  }
  categories: CatalogCategoryDTO[]
  media: AdminMediaDTO[]
}

export interface CatalogEntityPermissionsDTO {
  create: boolean
  delete: boolean
  read: boolean
  update: boolean
}

export interface ProductVariantsViewDTO {
  canReadPrice: boolean
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  media: AdminMediaDTO[]
  productID: AdminEntityID
  productName: string
  variants: ProductVariantDTO[]
}

export interface OrderListItemDTO {
  createdAt: string
  id: AdminEntityID
  itemCount: number
  orderNumber: string
  status: string
}

export interface OrdersListDTO {
  docs: OrderListItemDTO[]
  filters: {
    page: number
    search: string
    status: string
  }
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  totalDocs: number
  totalPages: number
}
