#!/bin/bash

## Please use this script after merging/fetching from transifex branch

mv zh_CN/* ./
rmdir zh_CN

echo "If no errors prompted, zh_CN folder should already been deleted, and all files are located at root directory."
