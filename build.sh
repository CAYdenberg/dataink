rm -rf npm
cp -r src npm

cd npm/core

mkdir src
shopt -s extglob
mv !(src) src/
cp ../../build/tsconfig.json .
cp ../../build/package.json .

npm i
npx tsc --project tsconfig.json

cd ../..