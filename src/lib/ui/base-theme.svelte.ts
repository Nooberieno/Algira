import type { Extension } from "@codemirror/state";
import { EditorView } from "codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const
    surface_primary: string = "var(--surface-primary)",
    surface_tooltip: string = "var(--surface-tooltip)",
    surface_highlight: string = "var(--surface-highlight)",
    surface_dark: string = "var(--surface-dark)",
    surface_search: string = "var(--surface-search)",
    text_primary: string = "var(--text-primary)",
    text_comment: string = "var(--text-comment)",
    syntax_types :string = "var(--syntax_types)",
    syntax_properties: string = "var(--syntax-properties)",
    syntax_operators: string = "var(--syntax-operators)",
    syntax_strings: string = "var(--syntax-strings)",
    syntax_functions: string = "var(--syntax-functions)",
    syntax_constants: string = "var(--syntax-constants)",
    syntax_keywords: string = "var(--syntax-keywords)",
    syntax_invalid: string = "var(--syntax-invalid)",
    syntax_braces: string = "var(--syntax-braces)",
    accent_cursor: string = "var(--accent-cursor)",
    accent_selection: string = "var(--accent-selection)",
    accent_highlight: string = "var(--accent-highlight)",
    accent_match: string = "var(--accent-match)",
    accent_search: string = "var(--accent-search)",
    accent_fold: string = "var(--accent-fold)",
    interacive_active: string = "var(--interactive-active)",
    interactive_border: string = "var(--interactive-border)",
    interactive_selection: string = "var(--interactive-selection)"

export const color = {
    surface_primary,
    surface_tooltip,
    surface_highlight,
    surface_dark,
    surface_search,
    text_primary,
    text_comment,
    syntax_types,
    syntax_properties,
    syntax_operators,
    syntax_strings,
    syntax_functions,
    syntax_constants,
    syntax_keywords,
    syntax_invalid,
    syntax_braces,
    accent_cursor,
    accent_selection,
    accent_highlight,
    accent_match,
    accent_search,
    accent_fold,
    interacive_active,
    interactive_border,
    interactive_selection
}

export const AlgiraStandardTheme = EditorView.theme({
    "&": {
        color: text_primary,
        backgroundColor: surface_primary
    },
    ".cm-content": {
        caretColor: accent_cursor
    },

    ".cm-cursor, .cm-dropCursor": {borderLeftColor: accent_cursor},
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {backgroundColor: accent_selection},

    ".cm-panels": {backgroundColor: surface_dark, color: text_primary},
    ".cm-panels.cm-panels-top": {borderBottom: "2px solid black"},
    ".cm-panels.cm-panels-bottom": {borderTop: "2px solid black"},

    ".cm-searchMatch": {
        backgroundColor: accent_match,
        outline: `1px solid ${accent_search}`
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: surface_search
    },

    ".cm-activeLine": {backgroundColor: accent_highlight},
    ".cm-selectionMatch": {backgroundColor: interactive_selection},

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: syntax_braces
    },

    ".cm-gutters": {
        backgroundColor: surface_primary,
        color: text_comment,
        border: "none"
    },

    ".cm-activeLineGutter": {
        backgroundColor: surface_highlight
    },

    ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: accent_fold
    },

    ".cm-tooltip": {
        border: "none",
        backgroundColor: surface_tooltip
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: surface_tooltip,
        borderBottomColor: surface_tooltip
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
        backgroundColor: surface_highlight,
        color: text_primary
        }
    }
})

export const AlgiraStandardHighlightStyle = HighlightStyle.define([
    {tag: t.keyword,
     color: syntax_keywords},
    {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
     color: syntax_properties},
    {tag: [t.function(t.variableName), t.labelName],
     color: syntax_functions},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)],
     color: syntax_constants},
    {tag: [t.definition(t.name), t.separator],
     color: text_primary},
    {tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
     color: syntax_types},
    {tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
     color: syntax_operators},
    {tag: [t.meta, t.comment],
     color: text_comment},
    {tag: t.strong,
     fontWeight: "bold"},
    {tag: t.emphasis,
     fontStyle: "italic"},
    {tag: t.strikethrough,
     textDecoration: "line-through"},
    {tag: t.link,
     color: text_comment,
     textDecoration: "underline"},
    {tag: t.heading,
     fontWeight: "bold",
     color: syntax_properties},
    {tag: [t.atom, t.bool, t.special(t.variableName)],
     color: syntax_constants },
    {tag: [t.processingInstruction, t.string, t.inserted],
     color: syntax_strings},
    {tag: t.invalid,
     color: syntax_invalid},
  ])

  export const AlgiraStandard: Extension = [AlgiraStandardTheme, syntaxHighlighting(AlgiraStandardHighlightStyle)]