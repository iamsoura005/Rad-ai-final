import { Link } from "react-router-dom";

const links = [
  { label: "Scan Analysis", to: "/scan" },
  { label: "Symptom Checker", to: "/symptoms" },
  { label: "Medicine Info", to: "/medicine" },
  { label: "Health Chat", to: "/chat" },
  { label: "History", to: "/history" },
];

function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-800 bg-gray-950/70">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <h4 className="text-sm font-semibold text-cyan-300">About RadiologyAI</h4>
          <p className="mt-2 text-sm text-gray-400">
            AI Doctor and Diagnostic Platform for medical imaging insights, symptom triage, medicine
            references, and health guidance.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cyan-300">Quick Links</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-300">
            {links.map((item) => (
              <li key={item.to}>
                <Link className="hover:text-cyan-300" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cyan-300">Disclaimer</h4>
          <p className="mt-2 text-sm text-gray-400">
            RadiologyAI is for informational purposes only and does not replace professional medical
            advice.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-3 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} RadiologyAI. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
