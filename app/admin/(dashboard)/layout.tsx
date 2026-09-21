import { redirect } from 'next/navigation';
import { isAdminSessionValid } from '@/lib/cms/auth';

export default async function AdminDashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminSessionValid())) {
    redirect('/admin/login');
  }
  return children;
}
