#!/bin/bash

wget --recursive --page-requisites --html-extension --convert-links --restrict-file-names=windows --domains website.org --no-parent --user-agent="Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.3) Gecko/2008092416 Firefox/3.0.3" --limit-rate=200k --random-wait -e robots=off $1
