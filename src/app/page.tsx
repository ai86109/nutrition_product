import MainSection from "@/components/section/main-section";
import { BioInfoProvider } from "@/contexts/BioInfoContext";

export default function Home() {
  return (
    <BioInfoProvider>
      <MainSection />
    </BioInfoProvider>
  );
}
