mkdir -p middle
mkdir -p small
cd large
for i in *.png ; do convert "$i" -density 150 -resize 24x24 "../middle/${i}"; done
for i in *.png ; do convert "$i" -density 150 -resize 16x16 "../small/${i}"; done
cd ..
