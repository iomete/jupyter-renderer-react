import { ReactNode } from "react";
import { CodeCell as CodeCellType } from "../../types/notebook";
import { ClassNames, Styles, Theme } from "../../types/props";
import { getClassName, getStyle, mergeStyles } from "../../utils/styles";
import { getNotebookLanguage } from "../../utils/parseNotebook";
import {
  highlightPythonCode,
  getPythonSyntaxColors,
} from "../../utils/syntaxHighlighter";
import { Output } from "./Output";

interface CodeCellProps {
  cell: CodeCellType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  showOutputs: boolean;
  renderCode?: (code: string, language: string) => ReactNode;
  renderImage?: (src: string, alt?: string) => ReactNode;
  renderHtml?: (html: string) => ReactNode;
  renderError?: (error: {
    ename: string;
    evalue: string;
    traceback: string[];
  }) => ReactNode;
  maxOutputHeight?: number | string;
  lazyLoad: boolean;
  notebookMetadata?: any;
}

export const CodeCell = ({
  cell,
  theme,
  classNames,
  styles,
  showOutputs,
  renderCode,
  renderImage,
  renderHtml,
  renderError,
  maxOutputHeight,
  lazyLoad,
  notebookMetadata,
}: CodeCellProps) => {
  const language = getNotebookLanguage({
    nbformat: 4,
    nbformat_minor: 0,
    metadata: notebookMetadata || {},
    cells: [],
  });

  const codeContent = Array.isArray(cell.source)
    ? cell.source.join("")
    : cell.source;
  const isDarkTheme = theme.name === "dark";
  const pythonColors = getPythonSyntaxColors(isDarkTheme);

  return (
    <div className={getClassName(classNames, "cellContent")}>
      <div
        className={getClassName(classNames, "sourceCode")}
        style={mergeStyles(getStyle(styles, "sourceCode"), {
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: pythonColors.background,
          position: "relative",
        })}
      >
        <pre
          style={{
            margin: 0,
            padding: "12px",
            backgroundColor: "transparent",
            border: "none",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            whiteSpace: "pre",
            overflow: "auto",
          }}
        >
          {renderCode ? (
            renderCode(codeContent, language)
          ) : (
            <code
              data-language={language}
              style={{
                backgroundColor: "transparent",
                color: "inherit",
                padding: 0,
                margin: 0,
                border: "none",
                whiteSpace: "pre",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              {language === "python"
                ? highlightPythonCode(codeContent, isDarkTheme)
                : codeContent}
            </code>
          )}
        </pre>
      </div>

      {showOutputs && cell.outputs.length > 0 && (
        <div style={{ marginTop: "2px" }}>
          <div
            className={getClassName(classNames, "outputs")}
            style={mergeStyles(
              { flex: 1 },
              getStyle(styles, "outputs"),
              maxOutputHeight
                ? {
                    maxHeight:
                      typeof maxOutputHeight === "number"
                        ? `${maxOutputHeight}px`
                        : maxOutputHeight,
                    overflowY: "auto",
                  }
                : undefined
            )}
          >
            {cell.outputs.map((output, index) => (
              <Output
                key={index}
                output={output}
                theme={theme}
                classNames={classNames}
                styles={styles}
                renderImage={renderImage}
                renderHtml={renderHtml}
                renderError={renderError}
                lazyLoad={lazyLoad}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
