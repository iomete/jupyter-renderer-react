import React from "react";
import { FetchOptions, JupiterNotebookViewerProps } from "../../types/props";
import { JupyterNotebook } from "../../types/notebook";
import { parseNotebook } from "../../utils/parseNotebook";
import {
  loadNotebookSourceFromPath,
  isNotebookFilePath,
} from "../../utils/fileLoader";
import {
  cx,
  getTheme,
  getClassName,
  getStyle,
  mergeStyles,
  applyThemeStyles,
} from "../../utils/styles";
import { Cell } from "./Cell";
import { JsonSource } from "./JsonSource";

interface LoadedNotebook {
  input: JupiterNotebookViewerProps['notebook'];
  requestKey: string;
  source: string | null;
  parsed: JupyterNotebook | null;
  error: Error | null;
}

export const JupiterNotebookViewer = ({
  notebook,
  view = "notebook",
  className,
  classNames,
  styles,
  theme = "light",
  showCellNumbers = true,
  showOutputs = true,
  collapsible = false,
  fetchOptions,
  renderMarkdown,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  onCellClick,
  onError,
  onFileLoad,
  onFileError,
  lazyLoad = false,
  maxOutputHeight,
}: JupiterNotebookViewerProps) => {
  const [loaded, setLoaded] = React.useState<LoadedNotebook | null>(null);
  const [activeCell, setActiveCell] = React.useState<number | null>(null);

  const filePath = isNotebookFilePath(notebook) ? notebook.filePath : null;
  // A host commonly recreates its props when switching views. Only changes to
  // the actual input or request options should trigger another network request.
  const input = filePath ?? notebook;
  const requestKey = filePath === null ? "" : JSON.stringify({
    headers: Object.entries(fetchOptions?.headers ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    credentials: fetchOptions?.credentials,
    timeout: fetchOptions?.timeout,
  });
  const callbacks = React.useRef({ onError, onFileLoad, onFileError });
  React.useEffect(() => {
    callbacks.current = { onError, onFileLoad, onFileError };
  }, [onError, onFileLoad, onFileError]);

  // Do not briefly expose the previous file while the next effect starts.
  const current = loaded?.input === input && loaded.requestKey === requestKey
    ? loaded
    : null;
  const parsedNotebook = current?.parsed ?? null;
  const error = current?.error ?? null;

  const themeObject = React.useMemo(() => getTheme(theme), [theme]);

  // Get JupyterLab theme class name
  const jupyterLabThemeClass = React.useMemo(() => {
    if (typeof theme === 'string') {
      return `jp-theme-${theme}`;
    }
    return null;
  }, [theme]);

  // Load and parse notebook based on an input type
  React.useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoaded(null);
    setActiveCell(null);

    const loadNotebook = async () => {
      let source: string | null = null;
      let parsed: JupyterNotebook | null = null;
      let loadError: Error | null = null;

      try {
        if (filePath !== null) {
          const request = JSON.parse(requestKey) as {
            headers: [string, string][];
            credentials?: FetchOptions['credentials'];
            timeout?: number;
          };
          source = await loadNotebookSourceFromPath(filePath, {
            headers: Object.fromEntries(request.headers),
            credentials: request.credentials,
            timeout: request.timeout,
          }, controller.signal);
        } else {
          const serialized = typeof input === "string"
            ? input
            : JSON.stringify(input, null, 2);
          if (typeof serialized !== "string") {
            throw new Error("Notebook could not be serialized as JSON");
          }
          source = serialized;
        }

        if (!active) return;
        if (filePath !== null && !source.trim()) {
          throw new Error(`Notebook file is empty: ${filePath}`);
        }
        // Parse a separate model; keep the original representation for JSON.
        try {
          parsed = parseNotebook(source);
        } catch (parseError) {
          if (filePath !== null) {
            throw new Error(
              `Invalid notebook format in file ${filePath}: ${
                parseError instanceof Error ? parseError.message : 'Unknown parsing error'
              }`
            );
          }
          throw parseError;
        }
      } catch (err) {
        loadError =
          err instanceof Error ? err : new Error("Failed to load notebook");
      }

      if (!active) return;
      setLoaded({ input, requestKey, source, parsed, error: loadError });
      if (loadError) {
        if (filePath !== null) callbacks.current.onFileError?.(loadError);
        else callbacks.current.onError?.(loadError);
      } else if (filePath !== null && parsed) {
        callbacks.current.onFileLoad?.(parsed);
      }
    };

    loadNotebook();
    return () => {
      active = false;
      controller.abort();
    };
  }, [input, filePath, requestKey]);

  // Source inspection remains available when JSON or notebook validation fails.
  if (view === "json" && current?.source !== null && current?.source !== undefined) {
    return (
      <div
        className={cx(className, jupyterLabThemeClass, getClassName(classNames, "root"))}
        style={mergeStyles(
          applyThemeStyles(themeObject, "root"),
          { padding: "16px" },
          getStyle(styles, "root")
        )}
      >
        <JsonSource
          source={current.source}
          theme={themeObject}
          className={getClassName(classNames, "jsonSource")}
          style={getStyle(styles, "jsonSource")}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cx(className, jupyterLabThemeClass, getClassName(classNames, "root"))}
        style={mergeStyles(
          applyThemeStyles(themeObject, "root"),
          { padding: "20px", textAlign: "center" },
          getStyle(styles, "root")
        )}
      >
        <div style={{ color: themeObject.colors.errorText }}>
          <h3>Error parsing notebook</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!parsedNotebook) {
    const loadingMessage = filePath !== null
      ? `Loading notebook from ${filePath}...`
      : "Loading notebook...";

    return (
      <div
        className={cx(className, jupyterLabThemeClass, getClassName(classNames, "root"))}
        style={mergeStyles(
          applyThemeStyles(themeObject, "root"),
          { padding: "20px", textAlign: "center" },
          getStyle(styles, "root")
        )}
      >
        <div>{loadingMessage}</div>
      </div>
    );
  }

  // Render notebook
  return (
    <div
      className={cx(className, jupyterLabThemeClass, getClassName(classNames, "root"))}
      style={mergeStyles(
        applyThemeStyles(themeObject, "root"),
        { padding: "16px" },
        getStyle(styles, "root")
      )}
    >
      {parsedNotebook.cells.map((cell, index) => (
        <Cell
          key={index}
          cell={cell}
          index={index}
          theme={themeObject}
          classNames={classNames}
          styles={styles}
          showCellNumber={showCellNumbers}
          showOutputs={showOutputs}
          collapsible={collapsible}
          renderMarkdown={renderMarkdown}
          renderCode={renderCode}
          renderImage={renderImage}
          renderHtml={renderHtml}
          renderError={renderError}
          onClick={() => {
            setActiveCell(index);
            onCellClick?.(cell, index);
          }}
          maxOutputHeight={maxOutputHeight}
          lazyLoad={lazyLoad}
          notebookMetadata={parsedNotebook.metadata}
          isActive={activeCell === index}
        />
      ))}
    </div>
  );
};
