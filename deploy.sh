#!/bin/bash
rm -rf .vuepress/dist
echo -e "Cloning gh-pages...\n"
git clone -v --branch gh-pages git@github.com:v2fly/v2ray-step-by-step.git ./.vuepress/old_dist
rm -rv .vuepress/old_dist/*
echo -e "Start building...\n"
vuepress build .
DEV_VER=$(git rev-parse --short dev)
TRANSIFEX_VER=$(git rev-parse --short transifex)
COMMIT_MSG="dev@$DEV_VER / transifex@$TRANSIFEX_VER"
echo "\nNext deployment will be noted as \"$COMMIT_MSG\""
echo -e "\nCheck if build prompted any errors.\nPress any key to countinue..."
read
cp -rpf .vuepress/dist/* .vuepress/old_dist/
cd .vuepress/old_dist/
echo "guide.v2fly.org" > CNAME
git config user.name V2FlyContrib
git config user.email SharedAccount+V2FlyContrib@unial.org
git config commit.gpgsign false
git add -A
git commit -m "$COMMIT_MSG"
read
git push -f -v --progress git@github.com:v2fly/v2ray-step-by-step.git gh-pages:gh-pages
cd ../
rm -rfv dist/
rm -rfv old_dist/
echo "Done."
