import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Calculator } from "@/components/Calculator";
import { Schemes } from "@/components/Schemes";
import { Vendors } from "@/components/Vendors";
import { Carbon } from "@/components/Carbon";
import { EMI } from "@/components/EMI";
import { Footer } from "@/components/Footer";
import { Cleaning } from "@/components/Cleaning";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SolarWise – Smart Solar Decision & Government Scheme Advisor" },
      {
        name: "description",
        content:
          "Calculate solar savings, explore Indian government subsidies, compare vendors, and plan EMI — all in one intelligent platform.",
      },
      { property: "og:title", content: "SolarWise – Smart Solar Advisor" },
      {
        property: "og:description",
        content:
          "Solar savings calculator, PM Surya Ghar schemes, vendor comparison & ROI in one place.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Calculator />
        <Schemes />
        <Vendors />
        <Cleaning />
        <Carbon />
        <EMI />
      </main>
      <Footer />
    </div>
  );
}
