#!/bin/bash
clear;

layername=$(ogrinfo "$1" | grep "1:" | awk '{print $2}')
count=$(ogrinfo -so -ro "$1" "$layername" | grep "Feature Count:" | awk '{print $3}')

echo $layername

if [ -d $3 ]; then
	echo "The directory $3 is now ready."
else
	mkdir -p "$3"
	echo "The directory $3 is has just been created and now ready."
fi

for (( i=0; i<$count; i++ )); do
   echo "Processing feature #$i..."
   filename=$(ogrinfo -fid $i -ro -noextent -nomd -geom=NO "$1" "$layername" | grep "$2 " | awk '{print $4}')
   ogr2ogr -f GeoJSON -t_srs EPSG:4326 -sql "SELECT fws_tacode AS code, ta_name AS name, descrip AS description, area AS region from $layername" -fid "$i" -lco RFC7946=YES -lco COORDINATE_PRECISION=6 "$3/$filename.json" "$1"
done
