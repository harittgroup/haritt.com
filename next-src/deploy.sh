#!/bin/sh
# Copies the Next.js export (next-src/out) into the haritt.com site root. Run from next-src after `npx next build`.
set -e
cd "$(dirname "$0")"
rm -rf out/404.html out/404 out/playbooks/img out/icons
rm -rf ../_next
cp -R out/. ../
echo "deployed next export"
