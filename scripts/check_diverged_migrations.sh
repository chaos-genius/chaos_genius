#!/usr/bin/env bash
set -euo pipefail

HEADS=`flask db heads`

if [ `echo "$HEADS" | wc -l` -gt 1 ]
then
    echo "Migrations have diverged - there are more than one heads!"
    echo "$HEADS"
    exit 1
else
    echo "Migrations have not diverged"
    exit 0
fi
