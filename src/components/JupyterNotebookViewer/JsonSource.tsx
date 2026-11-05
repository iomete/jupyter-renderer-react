import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { Theme } from '../../types/props';

interface JsonSourceProps {
  source: string;
  theme: Theme;
  className?: string;
  style?: CSSProperties;
}

interface JsonEntry {
  key?: string;
  value: JsonNode;
}

type JsonNode =
  | { kind: 'value'; text: string }
  | { kind: 'object' | 'array'; entries: JsonEntry[] };

const LONG_STRING_LENGTH = 512;
const INITIAL_ITEM_LIMIT = 20;
const MAX_FOLDING_DEPTH = 64;

/**
 * Validate with the JSON parser, but retain lexical values for display. Reading
 * the parsed object would round large numbers and discard duplicate keys.
 */
function readJsonSource(source: string): JsonNode | null {
  try {
    JSON.parse(source);
  } catch {
    return null;
  }

  const tokens = source.match(/"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g) || [];
  const stack: Array<{ node: Extract<JsonNode, { entries: JsonEntry[] }>; key?: string }> = [];
  let root: JsonNode | null = null;

  const append = (value: JsonNode) => {
    const parent = stack[stack.length - 1];
    if (parent) {
      parent.node.entries.push({ key: parent.key, value });
      parent.key = undefined;
    } else {
      root = value;
    }
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === ':' || token === ',') continue;
    if (token === '}' || token === ']') {
      stack.pop();
      continue;
    }
    if (tokens[index + 1] === ':') {
      stack[stack.length - 1].key = token;
      continue;
    }
    if (token === '{' || token === '[') {
      // Unusual nesting remains readable as plain source without constructing a
      // recursive React tree that could exceed the browser's call stack.
      if (stack.length >= MAX_FOLDING_DEPTH) return null;
      const node: Extract<JsonNode, { entries: JsonEntry[] }> = {
        kind: token === '{' ? 'object' : 'array',
        entries: [],
      };
      append(node);
      stack.push({ node });
    } else {
      append({ kind: 'value', text: token });
    }
  }

  return root;
}

const codeStyle: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  background: 'transparent',
  padding: 0,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

function JsonValue({ text, theme }: { text: string; theme: Theme }) {
  const color = text.startsWith('"')
    ? theme.colors.codeText
    : /^(true|false|null)$/.test(text)
      ? theme.colors.textSecondary
      : theme.colors.link;

  return <span style={{ color }}>{text}</span>;
}

interface JsonBranchProps {
  node: JsonNode;
  name?: string;
  depth: number;
  trailingComma?: boolean;
  theme: Theme;
}

function JsonBranch({ node, name, depth, trailingComma, theme }: JsonBranchProps) {
  const [open, setOpen] = useState(
    node.kind !== 'value' && (depth === 0 || (depth < 2 && node.entries.length <= INITIAL_ITEM_LIMIT)),
  );
  const key = name === undefined ? null : (
    <><span style={{ color: theme.colors.link }}>{name}</span>{': '}</>
  );
  const comma = trailingComma ? ',' : '';
  const summaryStyle: CSSProperties = {
    cursor: 'pointer',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  };
  const childrenStyle: CSSProperties = {
    paddingLeft: '1.25em',
    marginLeft: '0.25em',
    borderLeft: `1px solid ${theme.colors.border}`,
  };

  if (node.kind === 'value') {
    if (!node.text.startsWith('"') || node.text.length <= LONG_STRING_LENGTH) {
      return <div><code style={codeStyle}>{key}<JsonValue text={node.text} theme={theme} />{comma}</code></div>;
    }

    return (
      <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
        <summary style={summaryStyle}>
          <code style={codeStyle}>{key}<span style={{ color: theme.colors.codeText }}>"…"</span>{comma}</code>
          <span style={{ color: theme.colors.textSecondary, marginLeft: '0.75em', fontFamily: theme.fonts.base }}>
            {node.text.length - 2} source characters
          </span>
        </summary>
        {open && (
          <pre style={{ ...childrenStyle, marginTop: 0, marginBottom: 0, font: 'inherit', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            <code style={codeStyle}><JsonValue text={node.text} theme={theme} /></code>
          </pre>
        )}
      </details>
    );
  }

  const opening = node.kind === 'array' ? '[' : '{';
  const closing = node.kind === 'array' ? ']' : '}';

  if (node.entries.length === 0) {
    return <div><code style={codeStyle}>{key}{opening}{closing}{comma}</code></div>;
  }

  return (
    <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary style={summaryStyle}>
        <code style={codeStyle}>{key}{opening}{!open && ` … ${closing}${comma}`}</code>
        <span style={{ color: theme.colors.textSecondary, marginLeft: '0.75em', fontFamily: theme.fonts.base }}>
          {node.entries.length} {node.kind === 'array' ? 'items' : 'properties'}
        </span>
      </summary>
      {open && (
        <>
          <div style={childrenStyle}>
            {node.entries.map((entry, index) => (
              <JsonBranch
                key={index}
                node={entry.value}
                name={entry.key}
                depth={depth + 1}
                trailingComma={index < node.entries.length - 1}
                theme={theme}
              />
            ))}
          </div>
          <div><code style={codeStyle}>{closing}{comma}</code></div>
        </>
      )}
    </details>
  );
}

/** A read-only inspection of the source, independent of notebook validation. */
export function JsonSource({ source, theme, className, style }: JsonSourceProps) {
  const document = useMemo(() => readJsonSource(source), [source]);
  let content: ReactNode;

  if (document) {
    content = <JsonBranch key={source} node={document} depth={0} theme={theme} />;
  } else {
    content = (
      <pre style={{ margin: 0, font: 'inherit', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        <code style={codeStyle}>{source}</code>
      </pre>
    );
  }

  return (
    <div
      role="region"
      aria-label="Notebook JSON source"
      className={className}
      style={{
        color: theme.colors.codeText,
        backgroundColor: theme.colors.codeBg,
        fontFamily: theme.fonts.code,
        fontSize: theme.fontSize.code,
        lineHeight: 1.7,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        overflowWrap: 'anywhere',
        minWidth: 0,
        ...style,
      }}
    >
      {content}
    </div>
  );
}
