import React, { useState, useEffect } from 'react';
import { User, X, Save, RefreshCw, CheckCircle2, Sparkles, Building, GraduationCap, Briefcase, MapPin, Code2, Heart, Mail } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onLoadDemoProfile: (demoId: string) => void;
  onResetBlank: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onLoadDemoProfile,
  onResetBlank,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <User className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Personal Career Profile</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300">
                  Client Persisted
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalize your name, skills, and target goals across all AI reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Transparent Hackathon Demo Note */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Local Personalisation Mode: </span>
              Your details are saved in your local browser session and dynamically reflected in all AI evaluations, roadmaps, and interview transcripts. No email sign-up required.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Full Name</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Used in your personalized greeting and reports
              </span>
            </div>

            {/* 2. Email Address (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. aarav.sharma@college.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 3. Education Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                <span>Education Level</span>
              </label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Bachelor of Technology / B.E.">Bachelor of Technology / B.E.</option>
                <option value="Bachelor of Science (B.S. / B.Sc)">Bachelor of Science (B.S. / B.Sc)</option>
                <option value="Master of Science / M.Tech">Master of Science / M.Tech</option>
                <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                <option value="Bootcamp Graduate / Self-Taught">Bootcamp Graduate / Self-Taught</option>
                <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
              </select>
            </div>

            {/* 4. College or University (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>College / University (Optional)</span>
              </label>
              <input
                type="text"
                value={formData.college || ''}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. National Institute of Technology (NIT)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 5. Degree & Branch */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Degree & Major / Branch</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 6. Current Year / Experience Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Year of Study / Experience</label>
              <select
                value={formData.experienceYear}
                onChange={(e) => setFormData({ ...formData, experienceYear: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Final-Year / 4th Year Student">Final-Year / 4th Year Student</option>
                <option value="3rd Year Undergraduate">3rd Year Undergraduate</option>
                <option value="1st / 2nd Year Student">1st / 2nd Year Student</option>
                <option value="Recent Graduate (0-1 Years Experience)">Recent Graduate (0-1 Years Experience)</option>
                <option value="Junior Professional (1-2 Years Experience)">Junior Professional (1-2 Years Experience)</option>
              </select>
            </div>

            {/* 7. Target Job Role */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Job Role</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g. Software Developer, Data Analyst"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 8. Preferred Job Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Preferred Job Location</span>
              </label>
              <input
                type="text"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                placeholder="e.g. Bangalore, India (or Remote)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 9. Current Technical & Soft Skills */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Current Skills (Comma Separated)</span>
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Python, Java, JavaScript, React, Node.js, SQL, Docker, Git"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 10. Career Interests */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Career Interests & Focus Areas</span>
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g. Scalable web systems, cloud architecture, FinTech, machine learning"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Demo Selector */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Load sample:</span>
              <button
                type="button"
                onClick={() => onLoadDemoProfile('aarav-sharma')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
              >
                Aarav Sharma
              </button>
              <button
                type="button"
                onClick={() => onLoadDemoProfile('alex-chen')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
              >
                Alex Chen
              </button>
            </div>

            <button
              type="button"
              onClick={onResetBlank}
              className="text-[11px] text-slate-400 hover:text-rose-300 underline cursor-pointer"
            >
              Start Blank Profile
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-500 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Profile Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
