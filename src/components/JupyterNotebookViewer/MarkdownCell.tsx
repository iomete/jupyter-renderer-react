import { ReactNode } from "react";
import { marked } from "marked";
import { MarkdownCell as MarkdownCellType } from "../../types/notebook";
import { ClassNames, Styles, Theme } from "../../types/props";
import {
  cx,
  getClassName,
  getStyle,
  mergeStyles,
  applyThemeStyles,
} from "../../utils/styles";

interface MarkdownCellProps {
  cell: MarkdownCellType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
  renderMarkdown?: (content: string) => ReactNode;
  isActive?: boolean;
}

export const MarkdownCell = ({
  cell,
  theme,
  classNames,
  styles,
  renderMarkdown,
  isActive = false,
}: MarkdownCellProps) => {
  const content = Array.isArray(cell.source)
    ? cell.source.join("")
    : cell.source;

  const renderContent = () => {
    if (renderMarkdown) {
      return renderMarkdown(content);
    }

    // Use marked to parse markdown
    const html = marked(content, {
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert line breaks to <br>
    });
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={
          {
            padding: isActive ? '0 4px' : '1px 5px',
            border: isActive ? `1px solid ${theme.colors.border}` : 'none',
            boxSizing: 'border-box',
            lineHeight: "1.6",
            "& h1": {
              fontSize: "2em",
              marginTop: "0.67em",
              marginBottom: "0.67em",
              fontWeight: "bold",
            },
            "& h2": {
              fontSize: "1.5em",
              marginTop: "0.83em",
              marginBottom: "0.83em",
              fontWeight: "bold",
            },
            "& h3": {
              fontSize: "1.17em",
              marginTop: "1em",
              marginBottom: "1em",
              fontWeight: "bold",
            },
            "& h4": {
              fontSize: "1em",
              marginTop: "1.33em",
              marginBottom: "1.33em",
              fontWeight: "bold",
            },
            "& h5": {
              fontSize: "0.83em",
              marginTop: "1.67em",
              marginBottom: "1.67em",
              fontWeight: "bold",
            },
            "& h6": {
              fontSize: "0.67em",
              marginTop: "2.33em",
              marginBottom: "2.33em",
              fontWeight: "bold",
            },
            "& p": { marginBottom: "1em" },
            "& code": {
              backgroundColor: theme.colors.codeBg,
              padding: "2px 4px",
              borderRadius: theme.borderRadius.sm,
              fontFamily: theme.fonts.code,
              fontSize: "0.9em",
            },
            "& pre": {
              backgroundColor: theme.colors.codeBg,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              overflow: "auto",
              marginBottom: "1em",
            },
            "& pre code": {
              backgroundColor: "transparent",
              padding: 0,
            },
            "& a": {
              color: theme.colors.link,
              textDecoration: "none",
            },
            "& a:hover": {
              color: theme.colors.linkHover,
              textDecoration: "underline",
            },
            "& hr": {
              border: "none",
              borderTop: `1px solid ${theme.colors.border}`,
              margin: "1em 0",
            },
            "& ul, & ol": {
              marginBottom: "1em",
              paddingLeft: "2em",
            },
            "& li": {
              marginBottom: "0.25em",
            },
            "& ul.task-list": {
              listStyle: "none",
              paddingLeft: "0",
            },
            "& .task-list-item": {
              listStyle: "none",
              marginLeft: "0",
            },
            '& input[type="checkbox"]': {
              marginRight: "0.5em",
              verticalAlign: "middle",
            },
            "& blockquote": {
              borderLeft: `4px solid ${theme.colors.border}`,
              paddingLeft: theme.spacing.md,
              marginLeft: 0,
              marginBottom: "1em",
              color: theme.colors.textSecondary,
            },
            "& table": {
              borderCollapse: "collapse",
              marginBottom: "1em",
              width: "100%",
            },
            "& th, & td": {
              border: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.sm,
              textAlign: "left",
            },
            "& th": {
              backgroundColor: theme.colors.backgroundAlt,
              fontWeight: "bold",
            },
            "& del": {
              textDecoration: "line-through",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
            },
            "& sub": {
              verticalAlign: "sub",
              fontSize: "smaller",
            },
            "& sup": {
              verticalAlign: "super",
              fontSize: "smaller",
            },
          } as any
        }
      />
    );
  };

  return (
    <div
      className={getClassName(classNames, "cellContent")}
      style={{ position: "relative" }}
    >
      <div
        className={cx(
          getClassName(classNames, "source"),
          getClassName(classNames, "sourceMarkdown")
        )}
        style={mergeStyles(
          applyThemeStyles(theme, "sourceMarkdown"),
          getStyle(styles, "source"),
          getStyle(styles, "sourceMarkdown"),
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};
