import MainSection from "@/components/section/main-section";
import { BioInfoProvider } from "@/contexts/BioInfoContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { getProductsFromSheets } from "@/lib/products-server";

export default async function Home() {
  const allProducts = await getProductsFromSheets();

  return (
    <ProductProvider allProducts={allProducts}>
      <BioInfoProvider>
        <MainSection />
      </BioInfoProvider>
    </ProductProvider>
  );
}
