import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import {Redirect} from '@docusaurus/router';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return <Redirect to="/docs/introduction" />;
}
