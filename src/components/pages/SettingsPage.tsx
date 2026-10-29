
import React, { useState, useEffect } from 'react';
import { ThemeSettings } from '../../types';
import { Storage, DEFAULT_THEME } from '../../utils/storage';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  onThemeChanged?: (theme: ThemeSettings) => void;
}

const PRESETS: Record<string, Partial<ThemeSettings>> = {
  'dark-blue': {
    sidebarColor: '#071426',
    cardColor: '#102B4E',
    accentColor: '#38BDF8',
    textColor: '#F8FAFC',
    bgColor: '#071426',
    preset: 'dark-blue',
  },

  'light-blue': {
    sidebarColor: '#0F172A',
    cardColor: '#F0F9FF',
    accentColor: '#075985',
    textColor: '#0F172A',
    bgColor: '#E0F2FE',
    preset: 'light-blue',
  },

  'white-theme': {
    sidebarColor: '#111827',
    cardColor: '#FFFFFF',
    accentColor: '#075985',
    textColor: '#111827',
    bgColor: '#F1F5F9',
    preset: 'white-theme',
  },

  'black-theme': {
    sidebarColor: '#09090B',
    cardColor: '#27272A',
    accentColor: '#60A5FA',
    textColor: '#FAFAFA',
    bgColor: '#09090B',
    preset: 'black-theme',
  },

  'green-theme': {
    sidebarColor: '#052E25',
    cardColor: '#064E3B',
    accentColor: '#6EE7B7',
    textColor: '#ECFDF5',
    bgColor: '#022C22',
    preset: 'green-theme',
  },
};

const THEME_OPTIONS = [
  {
    id: 'dark-blue',
    label: 'Dark Blue',
    desc: 'Navy & Bright Cyan',
    primary: '#38BDF8',
    bg: '#071426',
    card: '#102B4E',
    text: '#F8FAFC',
    light: false,
  },
  {
    id: 'light-blue',
    label: 'Sky Blue',
    desc: 'Sky Blue & Deep Navy',
    primary: '#075985',
    bg: '#E0F2FE',
    card: '#F0F9FF',
    text: '#0F172A',
    light: true,
  },
  {
    id: 'white-theme',
    label: 'White',
    desc: 'White & Charcoal',
    primary: '#075985',
    bg: '#F1F5F9',
    card: '#FFFFFF',
    text: '#111827',
    light: true,
  },
  {
    id: 'black-theme',
    label: 'Black',
    desc: 'Black & Electric Blue',
    primary: '#60A5FA',
    bg: '#09090B',
    card: '#27272A',
    text: '#FAFAFA',
    light: false,
  },
  {
    id: 'green-theme',
    label: 'Green',
    desc: 'Forest & Mint',
    primary: '#6EE7B7',
    bg: '#022C22',
    card: '#064E3B',
    text: '#ECFDF5',
    light: false,
  },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onThemeChanged,
}) => {
  const [theme, setTheme] = useState<ThemeSettings>(() =>
    Storage.getThemeSettings()
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const isLightTheme =
    theme.preset === 'light-blue' ||
    theme.preset === 'white-theme';

  const panelClass = isLightTheme
    ? 'bg-white border-slate-300'
    : 'bg-slate-950 border-slate-700';

  const headingClass = isLightTheme
    ? 'text-slate-900'
    : 'text-slate-100';

  const bodyTextClass = isLightTheme
    ? 'text-slate-700'
    : 'text-slate-300';

  const mutedTextClass = isLightTheme
    ? 'text-slate-600'
    : 'text-slate-400';

  const inputClass = isLightTheme
    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500'
    : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400';

  useEffect(() => {
    Storage.applyThemeToDOM(theme);
  }, [theme]);

  const showSavedNotification = (
    msg: string = 'Theme updated successfully!'
  ) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const updateColor = (
    key: keyof ThemeSettings,
    val: string
  ) => {
    const updated = { ...theme, [key]: val };

    setTheme(updated);
    Storage.saveThemeSettings(updated);
    onThemeChanged?.(updated);
    showSavedNotification();
  };

  const applyPreset = (presetKey: string) => {
    const presetValues = PRESETS[presetKey];
    if (!presetValues) return;

    const updated = { ...theme, ...presetValues };

    setTheme(updated);
    Storage.saveThemeSettings(updated);
    onThemeChanged?.(updated);

    const selectedTheme = THEME_OPTIONS.find(
      (item) => item.id === presetKey
    );

    showSavedNotification(
      `${selectedTheme?.label ?? 'Theme'} applied successfully!`
    );
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    Storage.saveThemeSettings(DEFAULT_THEME);
    onThemeChanged?.(DEFAULT_THEME);

    showSavedNotification('Default theme restored.');
  };

  const renderColorControl = (
    title: string,
    key: 'sidebarColor' | 'cardColor' | 'accentColor' | 'textColor' | 'bgColor'
  ) => (
    <div
      className={`p-4 rounded-xl border space-y-3 ${panelClass}`}
      key={key}
    >
      <div className="flex items-center justify-between gap-2">
        <label className={`text-sm font-semibold ${headingClass}`}>
          {title}
        </label>

        <span
          className={`font-mono text-xs ${mutedTextClass}`}
        >
          {theme[key]}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${title} color picker`}
          value={theme[key]}
          onChange={(e) => updateColor(key, e.target.value)}
          className="w-12 h-11 rounded-lg border border-slate-400 bg-transparent cursor-pointer"
        />

        <input
          type="text"
          aria-label={`${title} HEX value`}
          value={theme[key]}
          onChange={(e) => updateColor(key, e.target.value)}
          className={`w-full min-w-0 py-2 px-3 rounded-lg border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${inputClass}`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${
          isLightTheme ? 'border-slate-300' : 'border-slate-700'
        }`}
      >
        <div>
          <h1
            className={`text-xl font-bold tracking-tight flex items-center gap-2 ${headingClass}`}
          >
            <Palette
              className="w-5 h-5"
              style={{ color: theme.accentColor }}
            />
            <span>Appearance & Theme Customization</span>
          </h1>

          <p className={`text-sm mt-2 ${mutedTextClass}`}>
            Customize colors across your application using the available
            theme presets and color controls.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
            isLightTheme
              ? 'text-slate-800 bg-white border-slate-300 hover:bg-slate-100'
              : 'text-slate-100 bg-slate-900 border-slate-600 hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Save Notification */}
      {saveStatus && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-600 text-emerald-900 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Theme Presets */}
      <section
        className={`p-5 rounded-2xl border shadow-sm space-y-4 ${panelClass}`}
      >
        <h2
          className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${headingClass}`}
        >
          <Sparkles
            className="w-4 h-4"
            style={{ color: theme.accentColor }}
          />
          1. Choose Your Theme
        </h2>

        <p className={`text-sm ${mutedTextClass}`}>
          Select a color combination with clear text and contrasting panels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {THEME_OPTIONS.map((option) => {
            const selected = theme.preset === option.id;

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => applyPreset(option.id)}
                aria-pressed={selected}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  selected
                    ? 'border-sky-600 ring-2 ring-sky-200 shadow-md'
                    : 'border-slate-300 hover:border-sky-500 hover:shadow-sm'
                }`}
                style={{ backgroundColor: option.bg }}
              >
                <div
                  className="rounded-lg p-3 mb-3 border"
                  style={{
                    backgroundColor: option.card,
                    borderColor: option.light ? '#CBD5E1' : '#475569',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.primary }}
                    />
                    <span
                      className="h-2 rounded-full flex-1"
                      style={{
                        backgroundColor: option.text,
                        opacity: 0.85,
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <span
                      className="h-7 w-1/3 rounded"
                      style={{ backgroundColor: option.primary }}
                    />
                    <span
                      className="h-7 flex-1 rounded border"
                      style={{
                        backgroundColor: option.bg,
                        borderColor: option.light ? '#CBD5E1' : '#475569',
                      }}
                    />
                  </div>
                </div>

                <p
                  className="text-sm font-bold"
                  style={{ color: option.text }}
                >
                  {option.label}
                </p>

                <p
                  className="text-xs mt-1"
                  style={{
                    color: option.text,
                    opacity: 0.8,
                  }}
                >
                  {option.desc}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: option.primary }}
                  >
                    {selected ? 'Currently selected' : 'Preview theme'}
                  </span>

                  {selected && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: option.primary }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Color Customizer */}
      <section
        className={`p-5 rounded-2xl border shadow-sm space-y-4 ${panelClass}`}
      >
        <h2
          className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${headingClass}`}
        >
          <Palette
            className="w-4 h-4"
            style={{ color: theme.accentColor }}
          />
          2. Custom Color Settings
        </h2>

        <p className={`text-sm ${mutedTextClass}`}>
          Choose a color or enter its HEX code. Changes are saved as you
          make them.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {renderColorControl('Sidebar Background', 'sidebarColor')}
          {renderColorControl('Card & Panel Color', 'cardColor')}
          {renderColorControl('Accent Brand Color', 'accentColor')}
          {renderColorControl('Typography Text Color', 'textColor')}
          {renderColorControl('Main Canvas Background', 'bgColor')}
        </div>

        {/* Live color preview */}
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{
            backgroundColor: theme.bgColor,
            borderColor: theme.accentColor,
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: theme.textColor }}
          >
            Live Color Preview
          </p>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: theme.cardColor,
              color: theme.textColor,
              borderColor: theme.accentColor,
            }}
          >
            <p className="font-semibold text-sm">
              Sample Card & Text
            </p>
            <p className="text-sm mt-1">
              This preview helps you check text readability against the
              selected card and background colors.
            </p>

            <button
              type="button"
              className="mt-3 px-4 py-2 rounded-lg text-sm font-bold"
              style={{
                backgroundColor: theme.accentColor,
                color:
                  theme.preset === 'light-blue' ||
                  theme.preset === 'white-theme'
                    ? '#FFFFFF'
                    : theme.preset === 'green-theme'
                      ? '#052E25'
                      : '#071426',
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
