// src/utils/cloneUtils.ts
import type { Category } from "../redux/constants/categoryConstants";

// CRITICAL: Deep clone function to prevent state mutations
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  
  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

// FIXED: Deep clone category with proper typing
export const safeCloneCategory = (category: any): Category => {
  if (!category || typeof category !== 'object') return category;
  
  // First, deep clone the entire object to break all references
  const deepCloned = deepClone(category);
  
  // Then normalize the structure
  return {
    id: deepCloned.id || deepCloned._id,
    name: deepCloned.name || 'Unnamed Category',
    slug: deepCloned.slug || deepCloned.name?.toLowerCase().replace(/\s+/g, '-'),
    description: deepCloned.description || '',
    image: deepCloned.image || deepCloned.imageUrl || '/category-placeholder.jpg',
    icon: deepCloned.icon || '',
    isActive: deepCloned.isActive !== undefined ? deepCloned.isActive : true,
    sortOrder: deepCloned.sortOrder || 0,
    createdAt: deepCloned.createdAt || deepCloned.created_at,
    updatedAt: deepCloned.updatedAt || deepCloned.updated_at,
    
    // CRITICAL: Deep clone any nested arrays/objects (like products)
    products: Array.isArray(deepCloned.products) 
      ? deepCloned.products.map((product: any) => deepClone(product))
      : undefined,
    
    // Handle any other nested data
    ...Object.keys(deepCloned).reduce((acc, key) => {
      if (!['id', '_id', 'name', 'slug', 'description', 'image', 'imageUrl', 
            'icon', 'isActive', 'sortOrder', 'createdAt', 'updatedAt', 
            'created_at', 'updated_at', 'products'].includes(key)) {
        acc[key] = deepClone(deepCloned[key]);
      }
      return acc;
    }, {} as any)
  };
};

// Alternative: Use JSON parse/stringify for simple deep cloning (slower but safer)
export const jsonDeepClone = <T>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('JSON deep clone failed, falling back to shallow clone:', error);
    return { ...obj } as T;
  }
};