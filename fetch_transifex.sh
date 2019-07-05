#!/bin/bash

echo -e "\nPlease run in the root directory of the repository!\n"
echo -e "We are going to delete current old deployed files, please check below for your git status...\n"
sleep 0.5
git status
echo -e "\n"
ls -lah
echo -e "\n\nIf everything looks fine, press any key to continue..."
read

rm -rv advanced app basics en_US LICENSE.md prep README.md resource routing

echo -e "\nStart fetching from remote transifex branch..."
git fetch origin transifex --progress

echo -e"\nStart checking out files..."
git checkout origin/transifex -- zh_CN
git checkout origin/transifex -- en_US
mv -v zh_CN/* ./
rmdir -v zh_CN

echo -e "If no errors prompted, zh_CN folder should already been deleted, and all files are located at root directory."
