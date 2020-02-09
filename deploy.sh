#!/bin/bash

echo -e "Start building..."
vuepress build .

echo -e "\n\nCheck if build prompted any errors.\nPress any key to countinue..."
read

cd .vuepress/dist
echo "guide.v2fly.org" > CNAME
git init
git config user.email dctxmei@gmail.com
git config user.name Dct Mei
git config commit.gpgsign true
git add -A
git commit -m "build $(date -u '+#%U%g%w-%N')"
git push -f -v --progress git@github.com:dctxmei/v2ray-step-by-step.git master:gh-pages
cd ../
rm -rfv dist/
echo "Done."

