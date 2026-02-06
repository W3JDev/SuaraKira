import React, { useState } from "react";
import { supabase } from "../services/supabase";

interface OrganizationOnboardingProps {
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

type OnboardingStep = "choice" | "create-org" | "join-code" | "join-email";

const OrganizationOnboarding: React.FC<OrganizationOnboardingProps> = ({
  userEmail,
  userName,
  onComplete,
}) => {
  const [step, setStep] = useState<OnboardingStep>("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create organization state
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  // Join by code state
  const [inviteCode, setInviteCode] = useState("");

  // Join by email invitation state
  const [inviteToken, setInviteToken] = useState("");

  const handleCreatePersonalAccount = async () => {
    setLoading(true);
    setError("");

    try {
      // Create personal organization
      const { data: org, error: orgError } = await supabase.from("organizations").insert({
        name: `${userName}'s Business`,
        is_public: false,
      }).select().single();

      if (orgError) throw orgError;

      // Update user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: userEmail,
        full_name: userName,
        role: "admin",
        organization_id: org.id,
        account_type: "personal",
        is_owner: true,
      });

      if (profileError) throw profileError;

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to create personal account");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase.from("organizations").insert({
        name: orgName,
        description: orgDescription || null,
        is_public: false,
      }).select().single();

      if (orgError) throw orgError;

      // Update user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: userEmail,
        full_name: userName,
        role: "admin",
        organization_id: org.id,
        account_type: "organization",
        is_owner: true,
      });

      if (profileError) throw profileError;

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call the database function to join by code
      const { data, error } = await supabase.rpc("join_organization_by_code", {
        code: inviteCode.toUpperCase(),
        join_as_role: "staff",
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to join organization");

      onComplete();
    } catch (err: any) {
      setError(err.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByToken = async () => {
    if (!inviteToken.trim()) {
      setError("Invitation token is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call the database function to accept invitation
      const { data, error } = await supabase.rpc("accept_invitation", {
        invite_token: inviteToken,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to accept invitation");

      onComplete();
    } catch (err: any) {
      setError(err.message || "Invalid or expired invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SuaraKira!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Choice Step */}
        {step === "choice" && (
          <div className="space-y-4">
            <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
              How would you like to use SuaraKira?
            </p>

            <button
              onClick={handleCreatePersonalAccount}
              disabled={loading}
              className="w-full p-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">👤 Personal Account</h3>
                  <p className="text-sm text-indigo-100">
                    Track your own business transactions
                  </p>
                </div>
                <span className="text-3xl">→</span>
              </div>
            </button>

            <button
              onClick={() => setStep("create-org")}
              disabled={loading}
              className="w-full p-6 bg-white dark:bg-gray-700 border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    🏢 Create Organization
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set up a team with admin and staff roles
                  </p>
                </div>
                <span className="text-3xl">→</span>
              </div>
            </button>

            <button
              onClick={() => setStep("join-code")}
              disabled={loading}
              className="w-full p-6 bg-white dark:bg-gray-700 border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    🔗 Join Organization
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Join an existing team with an invite code
                  </p>
                </div>
                <span className="text-3xl">→</span>
              </div>
            </button>

            <button
              onClick={() => setStep("join-email")}
              disabled={loading}
              className="w-full p-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📧 I have an email invitation token
            </button>
          </div>
        )}

        {/* Create Organization Step */}
        {step === "create-org" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("choice")}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-2 mb-4"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Acme Restaurant, My Bakery"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                placeholder="What does your business do?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                ℹ️ You'll be the admin and can invite staff members later.
              </p>
            </div>

            <button
              onClick={handleCreateOrganization}
              disabled={loading || !orgName.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </div>
        )}

        {/* Join by Code Step */}
        {step === "join-code" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("choice")}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-2 mb-4"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC12345"
                maxLength={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest uppercase"
                disabled={loading}
              />
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                ℹ️ Ask your team admin for the 8-character invite code.
              </p>
            </div>

            <button
              onClick={handleJoinByCode}
              disabled={loading || inviteCode.length !== 8}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Organization"}
            </button>
          </div>
        )}

        {/* Join by Email Invitation Step */}
        {step === "join-email" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("choice")}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-2 mb-4"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invitation Token
              </label>
              <input
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Paste the token from your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ℹ️ Check your email for an invitation link from your team admin.
              </p>
            </div>

            <button
              onClick={handleJoinByToken}
              disabled={loading || !inviteToken.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Accepting..." : "Accept Invitation"}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
