    import React from 'react';
    import OrganizationOnboardingForm from './OrganizationOnboardingForm';
    import Logo from '../../assets/images/logo.svg';

    // import '../../assets/styles/addform.scss';
    import './organizationOnboarding.scss'
    const OrganizationOnboarding = () => {

   return (
        <>
     <div className="navbar-section">
        <img src={Logo} alt="Chaos Genius" />
        <h3>Chaos Genius</h3>
      </div>
      <div className="og-onboarding-container">
        <OrganizationOnboardingForm/>
      </div>
        </>
        )
    }

    export default OrganizationOnboarding;
