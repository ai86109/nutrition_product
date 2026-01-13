import MainSection from "@/components/section/main-section";
import { BioInfoProvider } from "@/contexts/BioInfoContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { getProductsFromSheets, getProductFromSupabase } from "@/lib/products-server";
import Navigation from "@/components/navigation";

export default async function Home() {
  const allProducts = await getProductsFromSheets();
  const products = await getProductFromSupabase();
  // console.log('Products from Supabase:', products);

  return (
    <ProductProvider allProducts={products}>
      <BioInfoProvider>
        <SearchProvider>
          <Navigation />
          <MainSection />
        </SearchProvider>
      </BioInfoProvider>
    </ProductProvider>
  );
}
