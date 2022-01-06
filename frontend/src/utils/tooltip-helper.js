import Tooltip from 'react-tooltip-lite';

export const CustomTooltip = (content, line) => {
  if (content && line && content.length > 35) {
    return (
      <Tooltip
        className="tooltip-name"
        direction="left"
        content={<span> {content}</span>}>
        {content}
      </Tooltip>
    );
  } else if (content && content.length > 30) {
    return (
      <Tooltip
        className="tooltip-name"
        direction="left"
        content={<span> {content}</span>}>
        {content}
      </Tooltip>
    );
  } else {
    return <>{content}</>;
  }
};
