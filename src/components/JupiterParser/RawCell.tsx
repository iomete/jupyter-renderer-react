import { RawCell as RawCellType } from '../../types/notebook';
import { ClassNames, Styles, Theme } from '../../types/props';
import { cx, getClassName, getStyle, mergeStyles, applyThemeStyles } from '../../utils/styles';

interface RawCellProps {
  cell: RawCellType;
  theme: Theme;
  classNames?: ClassNames;
  styles?: Styles;
}

export const RawCell = ({
  cell,
  theme,
  classNames,
  styles,
}: RawCellProps) => {
  const content = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
  
  return (
    <div className={getClassName(classNames, 'cellContent')}>
      <div
        className={cx(
          getClassName(classNames, 'source'),
          getClassName(classNames, 'sourceCode') // Use code styling for raw cells
        )}
        style={mergeStyles(
          applyThemeStyles(theme, 'sourceCode'),
          getStyle(styles, 'source'),
          getStyle(styles, 'sourceCode'),
          { 
            backgroundColor: theme.colors.backgroundAlt,
            border: `1px solid ${theme.colors.border}`,
          }
        )}
      >
        <pre style={{ margin: 0, overflow: 'auto' }}>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};