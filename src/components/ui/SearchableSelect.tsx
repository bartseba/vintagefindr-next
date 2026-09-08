'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X, Lightbulb } from 'lucide-react'

interface Option {
  value: string
  label: string
  group?: string
}

interface SearchableSelectProps {
  name: string
  label: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  onSuggest?: (value: string) => void
  suggestType?: 'brand' | 'category' | 'size'
}

export function SearchableSelect({
  name,
  label,
  options,
  value = '',
  onChange,
  placeholder = 'Suchen...',
  required = false,
  error,
  onSuggest,
  suggestType,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedValue, setSelectedValue] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs internal selection state when the `value` prop changes from outside (e.g. after a suggestion is accepted)
    setSelectedValue(value)
  }, [value])

  const selectedOption = options.find(opt => opt.value.toLocaleUpperCase() === selectedValue.toLocaleUpperCase())
  const selectedLabel = selectedOption?.label || ''

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options

    const query = searchQuery.toLowerCase().trim()
    return options.filter(option => (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      (option.group && option.group.toLowerCase().includes(query))
    ))
  }, [options, searchQuery])

  const groupedOptions = useMemo(() => {
    const grouped = filteredOptions.reduce((acc, option) => {
      const group = option.group || 'Andere'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(option)
      return acc
    }, {} as Record<string, Option[]>)

    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key]
      }
    })

    return grouped
  }, [filteredOptions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(-1)
    onChange?.(optionValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValue('')
    setSearchQuery('')
    onChange?.('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      <input type="hidden" name={name} value={selectedValue} required={required} />

      <div
        className={`input-field cursor-pointer flex items-center justify-between ${
          error ? 'border-red-500' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedValue ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabel || 'Bitte wählen'}
        </span>
        <div className="flex items-center gap-2">
          {selectedValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Auswahl löschen"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-vintage-primary focus:border-transparent"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => {
                  const newValue = e.target.value
                  setSearchQuery(newValue)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto" role="listbox">
            {filteredOptions.length > 0 ? (
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    {groupName}
                  </div>
                  {groupOptions.map((option) => {
                    const flatIndex = filteredOptions.indexOf(option)
                    const isHighlighted = flatIndex === highlightedIndex
                    const isSelected = option.value === selectedValue

                    return (
                      <div
                        key={option.value}
                        className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                          isHighlighted
                            ? 'bg-vintage-primary/10 text-vintage-primary'
                            : isSelected
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {option.label}
                      </div>
                    )
                  })}
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center">
                <div className="text-sm text-gray-500 mb-3">
                  Keine Ergebnisse gefunden
                </div>
                {onSuggest && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onSuggest(searchQuery.trim())
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                  >
                    <Lightbulb size={16} />
                    {suggestType === 'brand' && `"${searchQuery.trim()}" als Marke vorschlagen`}
                    {suggestType === 'category' && `"${searchQuery.trim()}" als Kategorie vorschlagen`}
                    {suggestType === 'size' && `"${searchQuery.trim()}" als Größe vorschlagen`}
                    {!suggestType && `"${searchQuery.trim()}" vorschlagen`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
