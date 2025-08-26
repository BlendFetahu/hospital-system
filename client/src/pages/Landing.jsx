import HeroSearchBar from "../components/search/HeroSearchBar";

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
    </main>
  );
}
