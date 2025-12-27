import { ArrowLeft, X, Calendar } from "lucide-react";
import Link from "next/link";

export default function PostJobsPage() {
  return (
    <div className="min-h-screen bg-blue-50/50 p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/employer/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <button className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Post a Job</h1>

        <form className="space-y-6">
          {/* Job Title (Corrected from screenshot typo 'Job Location') */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior UX Designer"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Enabled Talent"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
              />
             
            </div>
          </div>

          {/* Job Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Location
            </label>
            <input
              type="text"
              placeholder="e.g. Toronto, ON"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. 123 King St W, Toronto, ON"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
            />
          </div>

          {/* Years of experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Years of experience
            </label>
            <div className="flex flex-wrap gap-6">
              {["1 - 2", "2 - 3", "3 - 5", "5+"].map((exp) => (
                <label key={exp} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">{exp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Job Type
            </label>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Employment type
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                  {[
                    "Full time",
                    "Part time",
                    "Internship",
                    "Contract",
                    "Hourly based",
                  ].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="employmentType"
                        className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-600 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Work arrangement
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                  {["Remote", "Hybrid", "Onsite"].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="workArrangement"
                        className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-600 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preferred language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred language
            </label>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 bg-white">
              <option value="" disabled>
                Select a language
              </option>
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">Choose one language.</p>
          </div>

          {/* Urgently hiring */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Are you urgently hiring?
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="urgent"
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 text-sm leading-relaxed"
              placeholder={`Briefly describe the role and responsibilities.\n- Own the end-to-end design process\n- Collaborate with product and engineering\n- Deliver high-quality UI flows`}
            />
          </div>

          {/* Job Requirement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Requirement
            </label>
            <textarea
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 text-sm leading-relaxed"
              placeholder={`List the key requirements for the role.\n- 5+ years of relevant experience\n- Strong portfolio or work samples\n- Experience with design systems`}
            />
          </div>

          {/* Estimated Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Salary
            </label>
            <input
              type="text"
              placeholder="e.g. CAD 80,000 - 95,000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#D98836] hover:bg-[#c2792f] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
