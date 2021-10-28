import React from 'react';

import Note from '../../assets/images/alertnote.svg';

const Noalert = () => {
  return (
    <div className="no-data-card">
      <div className="no-data-img">
        <img src={Note} alt="No Alert" />
      </div>
      <h3>Add your first alert</h3>
      <p>
        You haven’t added any alert yet, tap ‘New Alert‘ button to add an alert
      </p>
    </div>
  );
};

export default Noalert;
