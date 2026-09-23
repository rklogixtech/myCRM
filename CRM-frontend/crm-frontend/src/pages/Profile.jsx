import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, ShieldCheck, KeyRound, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';
import Avatar from '../components/Avatar';
import { RoleBadge } from '../components/StatusBadge';
import { Spinner } from '../components/Bits';

export default function Profile() {
  const { user, setUser, refreshProfile } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Please choose an image under 1.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({ ...form, avatar: avatarPreview });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Your profile</h1>
        <p className="text-sm text-ink/50 dark:text-paper/50 mt-1">
          Manage your personal details and how you appear across the CRM.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <Avatar name={form.name} src={avatarPreview} size={72} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink dark:bg-amber-400 text-paper dark:text-ink flex items-center justify-center border-2 border-white dark:border-ink-soft"
            >
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </div>
          <div>
            <p className="font-display font-semibold text-lg">{user?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user?.role} />
              <span className="flex items-center gap-1 text-xs text-ink/40 dark:text-paper/40">
                <Mail size={11} /> {user?.email}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="Optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              rows={3}
              maxLength={500}
              className="input"
              placeholder="A short note about you, your territory or focus…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <p className="text-xs text-ink/30 dark:text-paper/30 mt-1 text-right">{form.bio.length}/500</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Spinner /> : 'Save changes'}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6 mb-6">
        <p className="font-display font-semibold mb-4 flex items-center gap-2">
          <KeyRound size={15} /> Change password
        </p>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              required
              type="password"
              className="input"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New password</label>
              <input
                required
                minLength={6}
                type="password"
                className="input"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                required
                minLength={6}
                type="password"
                className="input"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPw} className="btn-primary">
              {savingPw ? <Spinner /> : 'Update password'}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Calendar size={16} />
        </div>
        <div>
          <p className="text-sm font-medium">Member since</p>
          <p className="text-xs text-ink/40 dark:text-paper/40">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
