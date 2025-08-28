
import { Link } from "react-router-dom";

export default function StaffIntro() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Meet Our Dedicated Staff
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Behind every service we provide is a team of caring professionals 
          committed to your health and well-being.
        </p>

        <div className="mt-8">
          <Link
            to="/staff"
            className="rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            Meet Our Staff
          </Link>
        </div>
      </div>
    </section>
  );
}
