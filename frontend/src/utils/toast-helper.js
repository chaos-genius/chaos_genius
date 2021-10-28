import ToastSuccess from '../assets/images/toast-success.svg';
import ToastFailed from '../assets/images/toast-error.svg';
import Close from '../assets/images/close.svg';

export const CustomContent = ({ header, description, failed }) => (
  <div className="toaster-popup">
    {failed === true ? (
      <div className="toaster-title">
        {header && (
          <>
            <img src={ToastFailed} alt="Failed" />
            <h3>{header}</h3>
          </>
        )}
      </div>
    ) : (
      <div className="toaster-title">
        {header && (
          <>
            <img src={ToastSuccess} alt="Success" />
            <h3>{header}</h3>
          </>
        )}
      </div>
    )}
    {description && <div className="toaster-description">{description}</div>}
  </div>
);

export const CustomActions = ({ closeToast, color, backgroundColor }) => (
  <img
    src={Close}
    alt="Close"
    onClick={closeToast}
    className="toaster-popup-close"
  />
);
