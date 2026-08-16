#!/usr/bin/env bash
set -euo pipefail

if [ -d ".next/standalone" ]; then
  mkdir -p ".next/standalone/.next"

  if [ -d "public" ]; then
    rm -rf ".next/standalone/public"
    cp -R "public" ".next/standalone/public"
  fi

  if [ -d ".next/static" ]; then
    rm -rf ".next/standalone/.next/static"
    cp -R ".next/static" ".next/standalone/.next/static"
  fi

  cd ".next/standalone"
  exec node server.js
fi

exec npm start
