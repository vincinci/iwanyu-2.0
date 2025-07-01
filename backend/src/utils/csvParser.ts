import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

export interface ProductData {
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productCategory: string;
  type: string;
  tags: string;
  published: boolean;
  variants: VariantData[];
  images: ImageData[];
  seoTitle?: string;
  seoDescription?: string;
  status: string;
}

export interface VariantData {
  optionName1?: string;
  optionValue1?: string;
  optionName2?: string;
  optionValue2?: string;
  optionName3?: string;
  optionValue3?: string;
  sku?: string;
  grams?: number;
  inventoryTracker?: string;
  inventoryPolicy?: string;
  fulfillmentService?: string;
  price: number;
  compareAtPrice?: number;
  requiresShipping?: boolean;
  taxable?: boolean;
  barcode?: string;
  variantImage?: string;
  weightUnit?: string;
  taxCode?: string;
  costPerItem?: number;
}

export interface ImageData {
  src: string;
  position: number;
  altText?: string;
}

export class CSVProductParser {
  private csvFilePath: string;

  constructor(csvFilePath: string) {
    this.csvFilePath = csvFilePath;
  }

  async parseProducts(): Promise<ProductData[]> {
    return new Promise((resolve, reject) => {
      const products: Map<string, ProductData> = new Map();
      const results: any[] = [];

      fs.createReadStream(this.csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', () => {
          try {
            // Group rows by product handle
            for (const row of results) {
              const handle = row.Handle;
              if (!handle) continue;

              let product = products.get(handle);
              
              // If this is the first row for this product, create the product
              if (!product && row.Title) {
                product = {
                  handle: handle,
                  title: row.Title,
                  bodyHtml: row['Body (HTML)'] || '',
                  vendor: row.Vendor || 'My Store',
                  productCategory: row['Product Category'] || '',
                  type: row.Type || '',
                  tags: row.Tags || '',
                  published: row.Published === 'true' || row.Published === true,
                  variants: [],
                  images: [],
                  seoTitle: row['SEO Title'],
                  seoDescription: row['SEO Description'],
                  status: row.Status || 'active'
                };
                products.set(handle, product);
              }

              if (!product) continue;

              // Add variant if this row has variant data
              if (row['Variant SKU'] || row['Variant Price']) {
                const variant: VariantData = {
                  optionName1: row['Option1 Name'],
                  optionValue1: row['Option1 Value'],
                  optionName2: row['Option2 Name'],
                  optionValue2: row['Option2 Value'],
                  optionName3: row['Option3 Name'],
                  optionValue3: row['Option3 Value'],
                  sku: row['Variant SKU'],
                  grams: row['Variant Grams'] ? parseFloat(row['Variant Grams']) : undefined,
                  inventoryTracker: row['Variant Inventory Tracker'],
                  inventoryPolicy: row['Variant Inventory Policy'],
                  fulfillmentService: row['Variant Fulfillment Service'],
                  price: row['Variant Price'] ? parseFloat(row['Variant Price']) : 0,
                  compareAtPrice: row['Variant Compare At Price'] ? parseFloat(row['Variant Compare At Price']) : undefined,
                  requiresShipping: row['Variant Requires Shipping'] === 'true',
                  taxable: row['Variant Taxable'] === 'true',
                  barcode: row['Variant Barcode'],
                  variantImage: row['Variant Image'],
                  weightUnit: row['Variant Weight Unit'],
                  taxCode: row['Variant Tax Code'],
                  costPerItem: row['Cost per item'] ? parseFloat(row['Cost per item']) : undefined,
                };

                // Only add if it's a unique variant (check if similar variant already exists)
                const existingVariant = product.variants.find(v => 
                  v.sku === variant.sku || 
                  (v.optionValue1 === variant.optionValue1 && 
                   v.optionValue2 === variant.optionValue2 && 
                   v.optionValue3 === variant.optionValue3)
                );

                if (!existingVariant && variant.price > 0) {
                  product.variants.push(variant);
                }
              }

              // Add image if this row has image data
              if (row['Image Src']) {
                const position = parseInt(row['Image Position']) || product.images.length + 1;
                const existingImage = product.images.find(img => img.src === row['Image Src']);
                
                if (!existingImage) {
                  product.images.push({
                    src: row['Image Src'],
                    position: position,
                    altText: row['Image Alt Text']
                  });
                }
              }
            }

            // Convert Map to Array and sort images by position
            const productArray = Array.from(products.values()).map(product => ({
              ...product,
              images: product.images.sort((a, b) => a.position - b.position)
            }));

            resolve(productArray);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getProductStats(): Promise<{
    totalProducts: number;
    totalVariants: number;
    totalImages: number;
    categories: string[];
    vendors: string[];
  }> {
    const products = await this.parseProducts();
    
    const totalProducts = products.length;
    const totalVariants = products.reduce((sum, product) => sum + product.variants.length, 0);
    const totalImages = products.reduce((sum, product) => sum + product.images.length, 0);
    
    const categories = [...new Set(products.map(p => p.productCategory).filter(Boolean))];
    const vendors = [...new Set(products.map(p => p.vendor).filter(Boolean))];
    
    return {
      totalProducts,
      totalVariants,
      totalImages,
      categories,
      vendors
    };
  }

  // Method to get a sample of products for preview
  async getProductSample(limit: number = 5): Promise<ProductData[]> {
    const products = await this.parseProducts();
    return products.slice(0, limit);
  }
}

export default CSVProductParser;
