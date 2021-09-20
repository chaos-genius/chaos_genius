import { toast } from 'react-toastify';
import Toast_error from '../assets/images/toast-error.svg';

export const toastMessage = (data) => {
  const { type, message } = data;
  switch (type) {
    case 'success':
      // toast.success(
      //   <>
      //     <div className="toast-title">KPI</div>
      //     {message}
      //   </>
      // );
      toast.success(message);
      break;
    case 'warn':
      toast.warn(message);
      break;
    case 'error':
      toast(
        <div className="error-msg-toast">
          <img src={Toast_error} alt="Error" /> {message}
        </div>,
        {
          className: 'error-toast'
        }
      );
      break;
    default:
      toast('');
      break;
  }
};
