import 'server-only'
import { headers } from 'next/headers'
import { supabasePublic } from '@/lib/supabase/public'

/**
 * Ported from app/lib/audit.server.ts. `getRequestMetadata` took a Remix
 * `Request` object; Server Actions don't receive one, so this reads the
 * same IP/user-agent headers via `next/headers`'s `headers()` instead.
 * `url`/`method` (present in the Remix version's metadata) have no clean
 * equivalent in a Server Action context — `url` falls back to the
 * `referer` header (the page the action was invoked from, the closest
 * available proxy) and `method` is dropped, since Server Actions are
 * always POST under the hood and that fact carries no audit value.
 */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'export'

export type AuditResource =
  | 'vendor'
  | 'product'
  | 'settings'
  | 'extension'
  | 'suggestion'
  | 'collection'
  | 'dsa_report'
  | 'user'

export interface AuditLogEntry {
  userId: string
  userEmail: string
  actionType: AuditAction
  resourceType: AuditResource
  resourceId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface AuditLog extends AuditLogEntry {
  id: string
  createdAt: string
}

export interface AuditFilters {
  userId?: string
  resourceType?: AuditResource
  resourceId?: string
  actionType?: AuditAction
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

async function getRequestMetadata(): Promise<Record<string, unknown>> {
  const headerList = await headers()
  const forwardedFor = headerList.get('x-forwarded-for')
  const realIp = headerList.get('x-real-ip')
  const cfConnectingIp = headerList.get('cf-connecting-ip')
  const userAgent = headerList.get('user-agent')

  let ip = 'unknown'
  if (cfConnectingIp) {
    ip = cfConnectingIp
  } else if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    ip = realIp
  }

  return {
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    url: headerList.get('referer') || 'unknown',
  }
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  if (!supabasePublic) {
    console.warn('Audit logging skipped: supabasePublic not configured')
    return
  }

  try {
    const { error } = await supabasePublic.rpc('insert_audit_log', {
      p_user_id: entry.userId,
      p_user_email: entry.userEmail,
      p_action_type: entry.actionType,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_old_value: entry.oldValue || null,
      p_new_value: entry.newValue || null,
      p_metadata: entry.metadata || null,
    })

    if (error) {
      console.error('Audit log insert error:', error)
    }
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}

/**
 * Convenience function to log audit with request metadata included.
 */
export async function logAuditWithRequest(entry: Omit<AuditLogEntry, 'metadata'>): Promise<void> {
  const metadata = await getRequestMetadata()
  await logAudit({ ...entry, metadata })
}

interface RawAuditLog {
  id: string
  user_id: string
  user_email: string
  action_type: string
  resource_type: string
  resource_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLog[]> {
  if (!supabasePublic) {
    console.warn('Cannot retrieve audit logs: supabasePublic not configured')
    return []
  }

  try {
    const { data, error } = await supabasePublic.rpc('get_audit_logs', {
      p_user_id: filters.userId || null,
      p_resource_type: filters.resourceType || null,
      p_resource_id: filters.resourceId || null,
      p_action_type: filters.actionType || null,
      p_start_date: filters.startDate?.toISOString() || null,
      p_end_date: filters.endDate?.toISOString() || null,
      p_limit: filters.limit || 50,
      p_offset: filters.offset || 0,
    })

    if (error) {
      console.error('Failed to retrieve audit logs:', error)
      return []
    }

    return ((data || []) as RawAuditLog[]).map((log) => ({
      id: log.id,
      userId: log.user_id,
      userEmail: log.user_email,
      actionType: log.action_type as AuditAction,
      resourceType: log.resource_type as AuditResource,
      resourceId: log.resource_id || undefined,
      oldValue: log.old_value || undefined,
      newValue: log.new_value || undefined,
      metadata: log.metadata || undefined,
      createdAt: log.created_at,
    }))
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error)
    return []
  }
}

export async function getResourceAuditHistory(
  resourceType: AuditResource,
  resourceId: string,
  limit = 50
): Promise<AuditLog[]> {
  return getAuditLogs({ resourceType, resourceId, limit })
}

export async function getUserAuditHistory(userId: string, limit = 50): Promise<AuditLog[]> {
  return getAuditLogs({ userId, limit })
}
