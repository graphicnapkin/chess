import React from 'react'

export const boardThemes = [
    { id: 'sand', name: 'Sand', light: '#f0e8d9', dark: '#b5a48b', highlight: '#e7ca8e' },
    { id: 'forest', name: 'Forest', light: '#edf0df', dark: '#82947a', highlight: '#d5d78d' },
    { id: 'ocean', name: 'Ocean', light: '#e8eef2', dark: '#8499ac', highlight: '#c1d7e7' },
    { id: 'walnut', name: 'Walnut', light: '#f0dfc8', dark: '#b08463', highlight: '#e8c078' },
    { id: 'plum', name: 'Plum', light: '#f0e9f2', dark: '#aa93b2', highlight: '#d8c5e4' },
] as const

export type BoardThemeId = typeof boardThemes[number]['id']

export function readBoardTheme(): BoardThemeId {
    try {
        const saved = localStorage.getItem('gnap-board-theme')
        return boardThemes.find(theme => theme.id === saved)?.id ?? 'sand'
    } catch { return 'sand' }
}

export default function BoardThemePicker({ value, onChange }: { value: BoardThemeId; onChange: (value: BoardThemeId) => void }) {
    return <fieldset className="theme-picker">
        <legend>Board theme</legend>
        <div className="theme-options">
            {boardThemes.map(theme => <label className="theme-option" key={theme.id}>
                <input type="radio" name="board-theme" value={theme.id} checked={value === theme.id} onChange={() => onChange(theme.id)} />
                <span className="theme-preview" style={{ '--square-light': theme.light, '--square-dark': theme.dark } as React.CSSProperties} aria-hidden="true">
                    <span className="theme-check">✓</span>
                </span>
                <span className="theme-name">{theme.name}</span>
            </label>)}
        </div>
    </fieldset>
}
