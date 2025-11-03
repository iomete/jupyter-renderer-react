import React from "react";
import { JupiterNotebookViewerProps } from "../../types/props";
import { JupyterNotebook } from "../../types/notebook";
import { NotebookFilePath } from "../../types/props";
import { parseNotebook } from "../../utils/parseNotebook";
import {
  loadNotebookFromPath,
  getNotebookInputType,
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

export const JupiterNotebookViewer = ({
  notebook,
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
  const [parsedNotebook, setParsedNotebook] = React.useState<JupyterNotebook | null>(
    null
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeCell, setActiveCell] = React.useState<number | null>(null);

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
    const loadNotebook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const inputType = getNotebookInputType(notebook);
        let parsed: JupyterNotebook;

        if (inputType === "filePath") {
          const filePathObj = notebook as NotebookFilePath;
          parsed = await loadNotebookFromPath(
            filePathObj.filePath,
            fetchOptions
          );
          onFileLoad?.(parsed);
        } else {
          parsed = parseNotebook(notebook as string | JupyterNotebook);
        }

        setParsedNotebook(parsed);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load notebook");
        setError(error);

        // Call appropriate error handler
        if (isNotebookFilePath(notebook)) {
          onFileError?.(error);
        } else {
          onError?.(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNotebook();
  }, [notebook, fetchOptions, onError, onFileLoad, onFileError]);

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
  if (isLoading || !parsedNotebook) {
    const loadingMessage = isNotebookFilePath(notebook)
      ? `Loading notebook from ${(notebook as NotebookFilePath).filePath}...`
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
