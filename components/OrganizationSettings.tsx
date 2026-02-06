import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

interface OrganizationSettingsProps {
  onClose: () => void;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  is_public: boolean;
  max_members?: number;
  created_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_owner: boolean;
  account_type: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  invited_by: string;
  created_at: string;
}

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"details" | "team" | "invitations">("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Organization state
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Invitation state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentUserRole(profile.role);

      // Get organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(org);
      setOrgName(org.name);
      setOrgDescription(org.description || "");

      // Get team members
      const { data: members, error: membersError } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true });

      if (membersError) throw membersError;
      setTeamMembers(members || []);

      // Get invitations (if admin)
      if (profile.role === "admin") {
        const { data: invites, error: invitesError } = await supabase
          .from("invitations")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .order("created_at", { ascending: false });

        if (invitesError) throw invitesError;
        setInvitations(invites || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          name: orgName,
          description: orgDescription || null,
        })
        .eq("id", organization!.id);

      if (updateError) throw updateError;

      setSuccess("Organization updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setError("Invalid email address");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a unique token
      const token = crypto.randomUUID();

      const { error: inviteError } = await supabase.from("invitations").insert({
        organization_id: organization!.id,
        email: inviteEmail.toLowerCase(),
        role: inviteRole,
        invited_by: user.id,
        token: token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (inviteError) throw inviteError;

      setSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setShowInviteForm(false);
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      if (err.message.includes("duplicate")) {
        setError("This email has already been invited");
      } else {
        setError(err.message || "Failed to send invitation");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm("Delete this invitation?")) return;

    setSaving(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (deleteError) throw deleteError;

      setSuccess("Invitation deleted");
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete invitation");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: "admin" | "staff") => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    setSaving(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSuccess("User role updated");
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Remove ${userEmail} from the organization?`)) return;

    setSaving(true);
    setError("");

    try {
      // Set organization_id to null to remove from org
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ organization_id: null, account_type: "personal" })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSuccess("User removed from organization");
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to remove user");
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = () => {
    if (organization?.invite_code) {
      navigator.clipboard.writeText(organization.invite_code);
      setSuccess("Invite code copied!");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const copyInviteToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setSuccess("Invitation token copied!");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Organization Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "details"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              📋 Details
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "team"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              👥 Team ({teamMembers.length})
            </button>
            {currentUserRole === "admin" && (
              <button
                onClick={() => setActiveTab("invitations")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "invitations"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                📧 Invitations ({invitations.filter((i) => !i.accepted_at).length})
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  disabled={currentUserRole !== "admin"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  disabled={currentUserRole !== "admin"}
                />
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  Invite Code
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-700 rounded-lg text-2xl font-mono tracking-widest text-center">
                    {organization?.invite_code}
                  </code>
                  <button
                    onClick={copyInviteCode}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                  Share this code with people you want to join your organization
                </p>
              </div>

              {currentUserRole === "admin" && (
                <button
                  onClick={handleSaveOrganization}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {member.full_name}
                      </h3>
                      {member.is_owner && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs rounded-full">
                          Owner
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          member.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  </div>

                  {currentUserRole === "admin" && !member.is_owner && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeUserRole(member.id, e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-sm"
                        disabled={saving}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemoveUser(member.id, member.email)}
                        disabled={saving}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === "invitations" && currentUserRole === "admin" && (
            <div className="space-y-6">
              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  ➕ Send New Invitation
                </button>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">New Invitation</h3>
                    <button
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail("");
                        setError("");
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                      disabled={saving}
                    >
                      <option value="staff">Staff (can only see own transactions)</option>
                      <option value="admin">Admin (can see all org transactions)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSendInvitation}
                    disabled={saving || !inviteEmail.trim()}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Pending Invitations</h3>
                {invitations.filter((i) => !i.accepted_at).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                    No pending invitations
                  </p>
                ) : (
                  invitations
                    .filter((i) => !i.accepted_at)
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {invitation.email}
                            </p>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs rounded-full">
                              {invitation.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => copyInviteToken(invitation.token)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                          >
                            📋 Copy token
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                )}
              </div>

              {invitations.filter((i) => i.accepted_at).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Accepted Invitations</h3>
                  {invitations
                    .filter((i) => i.accepted_at)
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{invitation.email}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Joined: {new Date(invitation.accepted_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm rounded-full">
                          ✓ Joined
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
