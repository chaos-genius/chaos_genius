import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';

function toTitleCase(value) {
    if (value.includes('_')) {
        return value.replace(/\b\w+/g, function (s) {
            return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
        }).replace('_', ' ');
    }
    return value.replace(/\b\w+/g, function (s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    });

}



export default function BreadCrumb() {
    let location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    console.log("pathnames", pathnames)
    return (
        <Breadcrumbs aria-label="breadcrumb" className="custom-breadcrumb">
            <Link color="inherit" href="/" >Home</Link>
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                return last ? (
                    <Typography color='textPrimary' key={to}>
                        {toTitleCase(value)}
                    </Typography>
                ) : (
                    <Link color='inherit' component={RouterLink} to={to} key={to}>
                        {toTitleCase(value)}
                    </Link>
                )
            })}

            {/* <Link color="inherit" href="/getting-started/installation/" onClick={handleClick}>
                Core
      </Link>
            <Typography color="textPrimary">Breadcrumb</Typography> */}
        </Breadcrumbs>
    );
}
