#!/bin/bash
# Check if migration message has been provided
if [ -z "$1" ]; then 
    echo "Please provide a migration message (spaces should be separated by underscores)"
    exit 1
fi

supabase stop 
supabase db diff -f "$1"