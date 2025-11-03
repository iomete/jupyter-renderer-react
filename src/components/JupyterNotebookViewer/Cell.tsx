import React, { ReactNode } from "react";
import {
  Cell as CellType,
  isCodeCell,
  normalizeStringArray,
} from "../../types/notebook";
import { ClassNames, Styles, Theme } from "../../types/props";
import {
  cx,
  getClassName,
  getStyle,
  mergeStyles,
  applyThemeStyles,
} from "../../utils/styles";
import { CodeCell } from "./CodeCell";
import { MarkdownCell } from "./MarkdownCell";
import { RawCell } from "./RawCell";
import "./cell.css";

interface CellProps {
  cell: CellType;
  index: number;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  showCellNumber: boolean;
  showOutputs: boolean;
  collapsible: boolean;
  renderMarkdown?: (content: string) => ReactNode;
  renderCode?: (code: string, language: string) => ReactNode;
  renderImage?: (src: string, alt?: string) => ReactNode;
  renderHtml?: (html: string) => ReactNode;
  renderError?: (error: {
    ename: string;
    evalue: string;
    traceback: string[];
  }) => ReactNode;
  onClick?: () => void;
  maxOutputHeight?: number | string;
  lazyLoad: boolean;
  notebookMetadata?: any;
  isActive?: boolean;
}

export const Cell = ({
  cell,
  index,
  theme,
  classNames,
  styles,
  showCellNumber,
  showOutputs,
  collapsible,
  renderMarkdown,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  onClick,
  maxOutputHeight,
  lazyLoad,
  notebookMetadata,
  isActive = false,
}: CellProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleCollapse = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCollapsed(!isCollapsed);
  };

  // Get preview text for collapsed cells
  const getCollapsedPreview = () => {
    const source = normalizeStringArray(cell.source);

    if (cell.cell_type === "markdown") {
      // Extract first header or text snippet
      const lines = source.split("\n").filter((line) => line.trim());
      let preview = "";

      // Look for headers
      const headerMatch = lines.find((line) => line.match(/^#+\s+/));
      if (headerMatch) {
        preview = headerMatch;
      } else if (lines.length > 0) {
        preview = lines[0];
      }

      // Truncate if too long and ensure ellipsis at end
      if (preview.length > 50) {
        preview = preview.substring(0, 47) + "...";
      } else {
        // Always add three dots at the end, regardless of content
        preview = preview.trimEnd() + "...";
      }

      return preview;
    } else if (cell.cell_type === "code") {
      // Get first line, truncate to 100 chars and always add ellipsis
      const firstLine = source.split("\n")[0] || "";
      if (firstLine.length > 100) {
        return firstLine.substring(0, 97) + "...";
      }
      // Always add three dots at the end for code cells too
      return firstLine.trimEnd() + "...";
    } else if (cell.cell_type === "raw") {
      // Handle raw cells - similar to markdown but simpler
      const lines = source.split("\n").filter((line) => line.trim() !== "");
      let preview = "";

      if (lines.length > 0) {
        preview = lines[0];
      }

      // Truncate if too long and ensure ellipsis at end
      if (preview.length > 50) {
        preview = preview.substring(0, 47) + "...";
      } else {
        // Always add three dots at the end, regardless of content
        preview = preview.trimEnd() + "...";
      }

      return preview;
    }

    return "";
  };

  const cellTypeClass = getClassName(
    classNames,
    cell.cell_type === "code"
      ? "cellCode"
      : cell.cell_type === "markdown"
      ? "cellMarkdown"
      : "cellRaw"
  );

  const cellTypeStyle = getStyle(
    styles,
    cell.cell_type === "code"
      ? "cellCode"
      : cell.cell_type === "markdown"
      ? "cellMarkdown"
      : "cellRaw"
  );

  return (
    <div className="jupyter-notebook-viewer-cell">
      <div className="jupyter-notebook-viewer-cell-identifier-wrapper">
        {isActive && (
          <div
            className="jupyter-notebook-viewer-cell-identifier"
            onClick={handleCollapse}
          />
        )}
      </div>

      <div
        className={cx(
          "jupyter-notebook-viewer-cell-content",
          cell.cell_type === "code" && "cell-code",
          cell.cell_type === "markdown" && "cell-markdown",
          getClassName(classNames, "cell"),
          cellTypeClass,
          isCollapsed && getClassName(classNames, "collapsed")
        )}
        style={mergeStyles(
          applyThemeStyles(theme, "cell"),
          cellTypeStyle,
          getStyle(styles, "cell")
        )}
        onMouseEnter={(e) => {
          if (!isActive) {
            const element = e.currentTarget;
            if (cell.cell_type === "code") {
              element.style.borderLeftColor = "#42a5f5";
            } else if (cell.cell_type === "markdown") {
              element.style.borderLeftColor = "#66bb6a";
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderLeftColor = "transparent";
          }
        }}
        onClick={isActive ? undefined : onClick}
      >
        {showCellNumber && (
          <div
            className={cx(
              "jupyter-notebook-viewer-cell-number",
              collapsible && isCodeCell(cell) && "clickable",
              getClassName(classNames, "cellNumber")
            )}
            style={mergeStyles(
              applyThemeStyles(theme, "cellNumber"),
              getStyle(styles, "cellNumber")
            )}
            role={collapsible && isCodeCell(cell) ? "button" : undefined}
            aria-expanded={!isCollapsed}
            aria-label={
              isCodeCell(cell)
                ? `Cell ${index + 1}, execution count ${
                    cell.execution_count || "none"
                  }`
                : `Cell ${index + 1}`
            }
          >
            {isCodeCell(cell) && (
              <>
                [
                {(() => {
                  const count = cell.execution_count || "";
                  const countStr = count.toString();
                  return countStr.length > 3 ? "..." : countStr;
                })()}
                ]:
              </>
            )}
          </div>
        )}

        <div className="jupyter-notebook-viewer-cell-body">
          {!isCollapsed && (
            <>
              {cell.cell_type === "code" && (
                <CodeCell
                  cell={cell}
                  theme={theme}
                  classNames={classNames}
                  styles={styles}
                  showOutputs={showOutputs}
                  renderCode={renderCode}
                  renderImage={renderImage}
                  renderHtml={renderHtml}
                  renderError={renderError}
                  maxOutputHeight={maxOutputHeight}
                  lazyLoad={lazyLoad}
                  notebookMetadata={notebookMetadata}
                />
              )}

              {cell.cell_type === "markdown" && (
                <div>
                  <MarkdownCell
                    cell={cell}
                    theme={theme}
                    classNames={classNames}
                    styles={styles}
                    renderMarkdown={renderMarkdown}
                    isActive={isActive}
                  />
                </div>
              )}

              {cell.cell_type === "raw" && (
                <div>
                  <RawCell
                    cell={cell}
                    theme={theme}
                    classNames={classNames}
                    styles={styles}
                    isActive={isActive}
                  />
                </div>
              )}
            </>
          )}

          {isCollapsed && (
            <div
              className={cx("jupyter-notebook-viewer-cell-collapsed-preview")}
            >
              <div
                className="jupyter-notebook-viewer-cell-collapsed-content"
                onClick={() => setIsCollapsed(false)}
              >
                {getCollapsedPreview()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
