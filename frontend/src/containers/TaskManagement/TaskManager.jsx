import React, { useState } from 'react';

import { TASK_MANAGER_API_STATUS_URL } from '../../utils/url-helper';

import './taskmanager.scss';

const TaskManager = () => {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  return (
    <>
      <div className="container">
        <iframe
          title="API Status"
          className="responsive-iframe"
          onLoad={() => setIsIframeLoading(false)}
          src={TASK_MANAGER_API_STATUS_URL}></iframe>
          {isIframeLoading ? <div className="preload"></div> : null}
      </div>
    </>
  );
};
export default TaskManager;
