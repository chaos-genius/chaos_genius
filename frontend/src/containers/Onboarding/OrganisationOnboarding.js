    import React from 'react';
    import OrganisationOnboardingForm from './OrganisationOnboardingForm';
    import Logo from '../../assets/images/logo.svg';

    // import '../../assets/styles/addform.scss';
    import './organisationOnboarding.scss'
    const OrganisationOnboarding = () => {

   return (
        <>
     <div className="navbar-section">
        <img src={Logo} alt="Chaos Genius" />
        <h3>Chaos Genius</h3>
      </div>
      <div className="og-onboarding-container">
        <OrganisationOnboardingForm/>
      </div>
        </>
        )
    }

    export default OrganisationOnboarding;
