import type { Extension } from "@codemirror/state";
import { EditorView } from "codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const
    surface_primary: string = "#282c34",
    surface_tooltip: string = "#353a42",
    surface_highlight: string = "#2c313a",
    surface_dark: string = "#21252b",
    text_primary: string = "#abb2bf",
    text_comment: string = "#7d8799",
    synxtax_types :string = "#e5c07b",
    syntax_properties: string = "#e06c75",
    syntax_operators: string = "#56b6c2",
    sytnax_strings: string = "#98c379",
    syntax_functions: string = "#61afef",
    syntax_constants: string = "#d19a66",
    syntax_keywords: string = "#c678dd",
    syntax_invalid: string = "#ffffff",
    accent_cursor: string = "#528bff",
    accent_selection: string = "#3E4451",
    accent_highlight: string = "#6699ff0b",
    accent_match: string = "#72a1ff59",
    interacive_active: string = "#56b6c2",
    interactive_border: string = "#2c313a"

export const color = {
    surface_primary,
    surface_tooltip,
    surface_highlight,
    surface_dark,
    text_primary,
    text_comment,
    synxtax_types,
    syntax_properties,
    syntax_operators,
    sytnax_strings,
    syntax_functions,
    syntax_constants,
    syntax_keywords,
    syntax_invalid,
    accent_cursor,
    accent_selection,
    accent_highlight,
    accent_match,
    interacive_active,
    interactive_border
}

export const AlgiraDarkTheme = EditorView.theme({
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
        outline: "1px solid #457dff"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#6199ff2f"
    },

    ".cm-activeLine": {backgroundColor: accent_highlight},
    ".cm-selectionMatch": {backgroundColor: "#aafe661a"},

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: "#bad0f847"
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
        color: "#ddd"
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
}, {dark: true})

export const AlgiraDarkHighlightStyle = HighlightStyle.define([
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
     color: synxtax_types},
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
     color: sytnax_strings},
    {tag: t.invalid,
     color: syntax_invalid},
  ])

  export const AlgiraDark: Extension = [AlgiraDarkTheme, syntaxHighlighting(AlgiraDarkHighlightStyle)]