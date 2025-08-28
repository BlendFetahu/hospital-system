import HeroSearchBar from "../components/search/HeroSearchBar";
import WhyChooseUs from "../components/LandingPage/WhyChooseUs";
import OurServices from "../components/LandingPage/OurServices";
import Slider from "../components/LandingPage/Slider";
import StaffIntro from "../components/LandingPage/StaffIntro";
import OurLocation from "../components/LandingPage/OurLocation"

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-700 text-white">
      <div className="pt-24" />
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold">Need To Quickly Consult With Doctor?</h1>
        <div className="mt-10 flex justify-center">
          <HeroSearchBar />
        </div>
      </section>


     {/* Why Choose Us */}
      <section className="bg-white text-slate-900">
        <WhyChooseUs />
      </section>

      {/* Our Services */}
      <section>
        <OurServices />
      </section>


      {/* Slider */}
      <section className="py-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700">
        <Slider />
      </section>


      {/* Staff Intro */}
      <section className="bg-white text-slate-900">
        <StaffIntro />
      </section>


      {/* Our Location */}
      <section className="bg-white text-slate-900">
        <OurLocation />
      </section>


    </main>
    
  );
}
