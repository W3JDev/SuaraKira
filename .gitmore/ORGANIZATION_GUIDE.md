# 🏢 Organization Management Guide - SuaraKira

## Overview

SuaraKira now supports **multi-tenant organizations** with proper user roles, invitations, and complete data isolation.

---

## 🎯 Account Types

### 1. Personal Account
- **Best for:** Solo business owners, freelancers
- **Features:**
  - Your own private organization
  - You are the admin by default
  - Can invite staff later if you grow
  - Complete control over your data

### 2. Organization Account
- **Best for:** Teams, businesses with multiple users
- **Features:**
  - Create organization (you become admin/owner)
  - Invite staff members via email or code
  - Role-based access control
  - Centralized transaction management

---

## 👥 User Roles

### Owner/Admin
**Permissions:**
- ✅ View ALL transactions in the organization
- ✅ Create, edit, delete any transaction
- ✅ Invite new members (email or code)
- ✅ Change user roles (promote staff to admin)
- ✅ Remove users from organization
- ✅ Edit organization settings
- ✅ View organization analytics

**Access:** Full organizational data

### Staff
**Permissions:**
- ✅ View ONLY their own transactions
- ✅ Create new transactions
- ✅ Edit their own transactions
- ✅ Delete their own transactions (within 24 hours)
- ❌ Cannot see other staff's data
- ❌ Cannot invite users
- ❌ Cannot change roles

**Access:** Personal data only (organization-scoped)

---

## 🚀 Getting Started

### For New Users (First-Time Setup)

When you first sign up, you'll see the **Organization Onboarding** screen:

#### Option 1: Create Personal Account (Fastest)
1. Click **"👤 Personal Account"**
2. Done! Your business is ready
3. Organization name: "[Your Name]'s Business"
4. You can invite staff later

#### Option 2: Create Organization
1. Click **"🏢 Create Organization"**
2. Enter organization name (e.g., "Acme Restaurant")
3. Add optional description
4. Click **"Create Organization"**
5. You become the admin/owner
6. Share invite code with your team

#### Option 3: Join Existing Organization
1. Click **"🔗 Join Organization"**
2. Enter the **8-character invite code** (e.g., ABC12345)
3. Click **"Join Organization"**
4. You'll join as staff (admin can promote you later)

#### Option 4: Accept Email Invitation
1. Check your email for invitation
2. Copy the **invitation token**
3. Click **"📧 I have an email invitation token"**
4. Paste token and accept
5. You'll join with the role specified by admin

---

## 🎫 Invitation System

### Method 1: Invite Code (Easy)

**For Admins:**
1. Go to **Settings** → **Organization Settings**
2. Copy your **Invite Code** (e.g., ABC12345)
3. Share code via WhatsApp, SMS, or verbally
4. Anyone with the code can join as staff

**For New Users:**
1. Get invite code from your admin
2. During signup, choose **"Join Organization"**
3. Enter the 8-character code
4. Instant access!

**Pros:**
- ✅ Super fast
- ✅ Easy to share verbally
- ✅ No email needed
- ✅ Great for in-person onboarding

**Cons:**
- ⚠️ Anyone with code can join (until max members reached)
- ⚠️ No role specification (always joins as staff)

---

### Method 2: Email Invitation (Secure)

**For Admins:**
1. Go to **Settings** → **Organization Settings** → **Invitations** tab
2. Click **"➕ Send New Invitation"**
3. Enter email address
4. Select role: **Admin** or **Staff**
5. Click **"Send Invitation"**
6. User receives unique token (expires in 7 days)

**For New Users:**
1. Check email for invitation
2. Click link or copy token
3. During signup, choose **"📧 I have an email invitation token"**
4. Paste token
5. Join with pre-assigned role!

**Pros:**
- ✅ Secure (unique token per person)
- ✅ Can specify role (staff or admin)
- ✅ Auto-expires after 7 days
- ✅ Track who accepted

**Cons:**
- ⚠️ Requires email address
- ⚠️ Token can be long to type manually

---

## ⚙️ Organization Settings (Admin Only)

### Access Settings:
1. Click **⚙️ Settings** icon (top right)
2. Click **"🏢 Organization Settings"**

### Details Tab
- **Organization Name:** Update your company name
- **Description:** Add details about your business
- **Invite Code:** 8-character code for easy joining
  - Click **"📋 Copy"** to copy code
  - Share with new team members

### Team Tab
- **View all members** with their roles
- **Change roles:**
  - Select new role from dropdown
  - Click to confirm
- **Remove members:**
  - Click **"Remove"** button
  - Confirm deletion
  - User loses org access (can create personal account)

### Invitations Tab (Admin only)
- **Pending Invitations:**
  - See who hasn't joined yet
  - Copy token to resend
  - Delete expired invitations
- **Accepted Invitations:**
  - See who joined and when
  - Track invitation history

---

## 🔒 Data Security & Isolation

### How RLS (Row Level Security) Works:

**For Staff:**
```
When you query transactions, you ONLY see:
✅ Transactions YOU created
❌ Other staff's transactions
❌ Other organizations' transactions
```

**For Admin:**
```
When you query transactions, you see:
✅ ALL transactions in YOUR organization
✅ From all staff members
❌ Other organizations' transactions
```

**Database-Level Protection:**
- 🛡️ Security is enforced in PostgreSQL (not just frontend)
- 🛡️ Impossible to bypass with browser tools
- 🛡️ Complete isolation between organizations
- 🛡️ Automatic org assignment on transaction creation

---

## 📊 Use Cases

### Use Case 1: Solo Business Owner → Growing Team

**Day 1 (Solo):**
- Create **Personal Account**
- Track your own transactions
- You're the only user

**Day 30 (Hired 1 staff):**
1. Go to **Organization Settings** → **Invitations**
2. Send invitation to staff member (email or code)
3. Staff joins as **Staff** role
4. They can add transactions
5. You (admin) see everything
6. Staff only sees their own data

**Day 90 (Team of 5):**
1. Share invite code with all new hires
2. Promote trusted staff to **Admin** role
3. Multiple admins can manage team
4. All staff isolated from each other's personal data

---

### Use Case 2: Restaurant Chain

**Setup:**
- Create **Organization**: "Acme Restaurants"
- **Owner** account for CEO
- Invite **Admins** for each location manager
- Invite **Staff** for cashiers/waiters

**Workflow:**
- **Staff** enters sales at counter (only sees own sales)
- **Location Admin** sees all location transactions
- **Owner** sees everything across all locations
- Complete audit trail via organization

---

### Use Case 3: Family Business

**Setup:**
- Create **Organization**: "Family Bakery"
- **Admin**: Mom (owner)
- **Admin**: Dad (co-owner)
- **Staff**: Kids helping out

**Workflow:**
- Kids add expenses when buying supplies
- Parents review all transactions
- Kids can't see each other's personal entries
- Parents have full visibility

---

## 🔧 Common Tasks

### Promote Staff to Admin
1. Go to **Organization Settings** → **Team** tab
2. Find the user
3. Select **Admin** from dropdown
4. Confirm change
5. User now has admin permissions

### Remove User from Organization
1. Go to **Organization Settings** → **Team** tab
2. Find the user
3. Click **"Remove"** button
4. Confirm removal
5. User's account switches to personal mode
6. Their past transactions stay in org (for audit)

### Change Organization Name
1. Go to **Organization Settings** → **Details** tab
2. Edit **Organization Name**
3. Click **"Save Changes"**
4. All users see new name immediately

### Resend Invitation
1. Go to **Organization Settings** → **Invitations** tab
2. Find pending invitation
3. Click **"📋 Copy token"**
4. Send token to user via WhatsApp/Email
5. User enters token during signup

### Delete Expired Invitation
1. Go to **Organization Settings** → **Invitations** tab
2. Find expired invitation
3. Click **"Delete"** button
4. Create new invitation if needed

---

## 🚨 Troubleshooting

### Issue: "User can see other users' transactions"

**Check:**
1. Is RLS enabled? Run diagnostic:
   ```sql
   SELECT * FROM verify_rls_enabled();
   ```
2. Does user have correct organization_id?
3. Is user's role set correctly?

**Fix:**
- User should log out and log back in
- Clear browser cache
- Verify database migration was applied

---

### Issue: "Invite code not working"

**Check:**
1. Is code exactly 8 characters?
2. Is it uppercase? (codes are case-sensitive)
3. Has organization reached max members?

**Fix:**
- Ask admin to copy code again
- Try uppercase version
- Admin can regenerate invite code if needed

---

### Issue: "Email invitation expired"

**Check:**
- Invitations expire after 7 days

**Fix:**
1. Admin deletes old invitation
2. Admin sends new invitation
3. User accepts new token within 7 days

---

### Issue: "Can't remove user"

**Check:**
- Can't remove yourself
- Can't remove owner (only one owner per org)

**Fix:**
- Ask another admin to remove you
- Owner can transfer ownership first (manual DB update)

---

## 🎓 Best Practices

### For Admins:
1. ✅ Use **email invitations** for important roles
2. ✅ Use **invite code** for casual staff
3. ✅ Regularly review **Team** tab
4. ✅ Remove inactive users
5. ✅ Promote trusted staff to admin
6. ✅ Keep invite code private (don't post publicly)
7. ✅ Set description to help users identify org

### For Staff:
1. ✅ Keep your profile updated (name, email)
2. ✅ Ask admin if you need elevated permissions
3. ✅ Report transactions daily
4. ✅ Don't share invite codes outside team

---

## 📱 Mobile Usage

Same features available on mobile:
- Responsive UI adapts to screen size
- Touch-friendly buttons
- Easy invite code entry
- Full organization management

---

## 🔐 Security Notes

### Invite Codes:
- 8 characters (uppercase letters + numbers)
- Example: `ABC12345`
- Auto-generated on org creation
- Can be shared safely within team
- Consider regenerating if leaked publicly

### Invitation Tokens:
- UUID format (long, unique)
- One-time use
- Expires in 7 days
- Secure for email transmission
- Automatically invalidated after acceptance

### Data Access:
- RLS enforced at database level
- Frontend cannot bypass security
- API calls filtered by Supabase
- Complete audit trail in `audit_log` table

---

## 🛠️ Developer Notes

### Database Functions:
- `accept_invitation(token)` - Accept email invitation
- `join_organization_by_code(code, role)` - Join via invite code
- `generate_invite_code()` - Generate 8-char code
- `create_profile_with_org()` - Auto-create org on signup

### Tables:
- `organizations` - Org details + invite codes
- `profiles` - User profiles + org membership
- `invitations` - Pending/accepted invitations
- `transactions` - Transaction data (org-scoped)
- `audit_log` - Change tracking

### Triggers:
- `create_profile_with_org_trigger` - Auto-create personal org
- `set_transaction_organization_trigger` - Auto-assign org_id

---

## 📞 Support

**Need Help?**
- Check: `URGENT_FIX_SUMMARY.md`
- Check: `DATA_ISOLATION_FIX.md`
- Run diagnostic: `check-database-security.sql`

**Common Resources:**
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: https://github.com/W3JDev/SuaraKira

---

## ✨ Summary

**Organization Setup:**
1. New users choose: Personal vs Organization
2. Organization creators become admin
3. Admins invite staff via code or email
4. Complete data isolation guaranteed

**Roles:**
- **Admin:** Full org access
- **Staff:** Own data only

**Invitations:**
- **Code:** Fast, easy, anyone can join
- **Email:** Secure, role-specific, tracked

**Security:**
- Database-level RLS
- Automatic org assignment
- Complete audit trail

---

**Version:** 1.0
**Last Updated:** February 2026
**Status:** ✅ Production Ready
