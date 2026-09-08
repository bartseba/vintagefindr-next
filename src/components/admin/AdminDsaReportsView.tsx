'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  Shield,
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  LogOut,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { companyName } from '@/constant/routes'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { updateDsaReportStatus, type DsaReportUpdateState } from '@/app/admin/dsa-reports/actions'

export interface DsaReportListItem {
  id: string
  status: string
  violation_type: string
  content_url: string
  reporter_name: string
  created_at: string
}

export interface DsaReportDetail {
  id: string
  status: string
  violation_type: string
  content_url: string
  description: string
  reporter_name: string
  reporter_email: string
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
}

interface AdminDsaReportsViewProps {
  dsaReports: DsaReportListItem[]
  selectedReport: DsaReportDetail | null
  stats: { total: number; new: number; under_review: number; resolved: number; rejected: number }
  statusFilter: string
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateTime = (value: string) =>
  `${formatDate(value)} ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

const violationTypeLabels: Record<string, string> = {
  copyright: 'Urheberrecht',
  trademark: 'Markenrecht',
  fraud: 'Betrug',
  counterfeit: 'Fälschung',
  privacy: 'Datenschutz',
  illegal_content: 'Illegaler Inhalt',
  other: 'Sonstiger Rechtsverstoß',
}

const statusLabels: Record<string, string> = {
  new: 'Neu',
  under_review: 'In Bearbeitung',
  resolved: 'Gelöst',
  rejected: 'Abgelehnt',
}

const statusBadgeClasses: Record<string, string> = {
  new: 'bg-red-100 text-red-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-800',
}

const getViolationTypeLabel = (type: string) => violationTypeLabels[type] || type
const getStatusLabel = (status: string) => statusLabels[status] || status
const getStatusBadgeClass = (status: string) => statusBadgeClasses[status] || 'bg-gray-100 text-gray-800'

const initialState: DsaReportUpdateState = {}

export function AdminDsaReportsView({ dsaReports, selectedReport, stats, statusFilter }: AdminDsaReportsViewProps) {
  const [, formAction, isSubmitting] = useActionState(updateDsaReportStatus, initialState)

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-amber-600">{companyName}</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">DSA-Meldungen</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Zurück
                </Button>
              </Link>
              <form action={logoutAdmin}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut size={16} className="mr-2" />
                  Abmelden
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">DSA-Meldungen</h1>
          </div>
          <p className="text-gray-600">
            Verwaltung aller Meldungen gemäß Digital Services Act (Art. 16 EU 2022/2065)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link
            href="/admin/dsa-reports?status=all"
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
          </Link>

          <Link
            href="/admin/dsa-reports?status=new"
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === 'new' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Neu</p>
                <p className="text-2xl font-bold text-red-600">{stats.new}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </Link>

          <Link
            href="/admin/dsa-reports?status=under_review"
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === 'under_review' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Bearbeitung</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.under_review}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </Link>

          <Link
            href="/admin/dsa-reports?status=resolved"
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === 'resolved' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gelöst</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </Link>

          <Link
            href="/admin/dsa-reports?status=rejected"
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === 'rejected' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abgelehnt</p>
                <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-400" />
            </div>
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <a href={`/api/admin/dsa-reports/export?status=${statusFilter}`}>
            <Button type="button" variant="outline">
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </a>
        </div>

        {selectedReport ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Meldung #{selectedReport.id.slice(0, 8)}</h2>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Erstellt am {formatDateTime(selectedReport.created_at)}
                </p>
              </div>
              <Link href={`/admin/dsa-reports?status=${statusFilter}`}>
                <Button variant="outline" size="sm">
                  Zurück zur Liste
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Meldungsinformationen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Verstoßart</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getViolationTypeLabel(selectedReport.violation_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Content URL</p>
                    <a
                      href={selectedReport.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {selectedReport.content_url}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Beschreibung</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Reporter-Informationen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedReport.reporter_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">E-Mail</p>
                    <a
                      href={`mailto:${selectedReport.reporter_email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedReport.reporter_email}
                    </a>
                  </div>
                  {selectedReport.resolved_at && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bearbeitet am</p>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(selectedReport.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form action={formAction} className="border-t border-gray-200 pt-6">
              <input type="hidden" name="reportId" value={selectedReport.id} />

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                  Status ändern
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedReport.status}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="new">Neu</option>
                  <option value="under_review">In Bearbeitung</option>
                  <option value="resolved">Gelöst</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-900 mb-2">
                  Admin-Notizen
                </label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  rows={4}
                  defaultValue={selectedReport.admin_notes || ''}
                  placeholder="Interne Notizen zur Bearbeitung dieser Meldung..."
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verstoßart
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dsaReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getViolationTypeLabel(report.violation_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {report.content_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reporter_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/dsa-reports?status=${statusFilter}&view=${report.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        >
                          <Eye size={16} />
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {dsaReports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">Keine Meldungen gefunden</p>
                        <p className="text-sm text-gray-400">
                          {statusFilter !== 'all'
                            ? `Es gibt keine Meldungen mit dem Status "${getStatusLabel(statusFilter)}"`
                            : 'Es wurden noch keine DSA-Meldungen eingereicht'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
