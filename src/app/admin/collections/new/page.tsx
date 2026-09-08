import { requireAdminAuth } from '@/lib/auth/session'
import { AdminCollectionNewForm } from '@/components/admin/AdminCollectionNewForm'

export default async function AdminCollectionNewPage() {
  await requireAdminAuth()
  return <AdminCollectionNewForm />
}
