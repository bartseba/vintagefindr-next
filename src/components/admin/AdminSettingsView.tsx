'use client'

import { useActionState, useState } from 'react'
import { Save, Settings, Globe, CreditCard, Users, Mail, BarChart3, Zap, Shield, Share2 } from 'lucide-react'
import { updateSettings, type AdminSettingsState } from '@/app/admin/settings/actions'

export interface PlatformSetting {
  key: string
  value: string
  category: string
  description: string | null
  is_public: boolean
}

interface AdminSettingsViewProps {
  settings: Record<string, PlatformSetting[]>
}

const categoryIcons: Record<string, typeof Globe> = {
  general: Globe,
  seo: BarChart3,
  payment: CreditCard,
  fees: CreditCard,
  vendor: Users,
  email: Mail,
  analytics: BarChart3,
  features: Zap,
  limits: Shield,
  social: Share2,
}

const categoryLabels: Record<string, string> = {
  general: 'Allgemeine Einstellungen',
  seo: 'SEO Einstellungen',
  payment: 'Zahlungseinstellungen',
  fees: 'Gebühren & Provisionen',
  vendor: 'Vendor Einstellungen',
  email: 'E-Mail Einstellungen',
  analytics: 'Analytics',
  features: 'Features',
  limits: 'Limits',
  social: 'Social Media',
}

const initialState: AdminSettingsState = {}

export function AdminSettingsView({ settings }: AdminSettingsViewProps) {
  const [state, formAction, isSubmitting] = useActionState(updateSettings, initialState)
  const [activeCategory, setActiveCategory] = useState('general')

  const categories = Object.keys(settings).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Platform Einstellungen</h1>
          </div>
          <p className="text-gray-600">
            Verwalte alle Einstellungen für die Vintage Finder Platform
          </p>
        </div>

        {state.success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">{state.message}</p>
          </div>
        )}

        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white rounded-lg shadow p-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category] || Settings
                const label = categoryLabels[category] || category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === category
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <form action={formAction} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {categoryLabels[activeCategory] || activeCategory}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {settings[activeCategory]?.map((setting) => (
                  <SettingField key={setting.key} setting={setting} />
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Speichern...' : 'Änderungen speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingField({ setting }: { setting: PlatformSetting }) {
  let parsedValue: unknown
  try {
    parsedValue = JSON.parse(setting.value)
  } catch {
    parsedValue = setting.value
  }

  const renderInput = () => {
    if (typeof parsedValue === 'boolean') {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={setting.key}
            defaultChecked={parsedValue}
            className="h-5 w-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
          />
          <span className="text-sm text-gray-600">
            {parsedValue ? 'Aktiviert' : 'Deaktiviert'}
          </span>
        </label>
      )
    }

    if (typeof parsedValue === 'number') {
      return (
        <input
          type="number"
          name={setting.key}
          defaultValue={parsedValue}
          step="any"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      )
    }

    if (Array.isArray(parsedValue)) {
      return (
        <input
          type="text"
          name={setting.key}
          defaultValue={JSON.stringify(parsedValue)}
          placeholder='["value1", "value2"]'
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
        />
      )
    }

    if (setting.key.includes('email') || setting.key.includes('url')) {
      return (
        <input
          type="text"
          name={setting.key}
          defaultValue={parsedValue as string}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      )
    }

    if (setting.description && setting.description.length > 100) {
      return (
        <textarea
          name={setting.key}
          defaultValue={parsedValue as string}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      )
    }

    return (
      <input
        type="text"
        name={setting.key}
        defaultValue={parsedValue as string}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <label htmlFor={setting.key} className="block font-medium text-gray-900">
            {setting.key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </label>
          {setting.description && (
            <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
          )}
        </div>
        {setting.is_public && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Öffentlich
          </span>
        )}
      </div>
      {renderInput()}
      <p className="text-xs text-gray-400">
        Key: <code className="bg-gray-100 px-1 py-0.5 rounded">{setting.key}</code>
      </p>
    </div>
  )
}
