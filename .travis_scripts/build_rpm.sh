#!/bin/sh

sudo apt-get install rpm

mkdir -p ~/rpmbuild/SOURCES
cp target/*jar ~/rpmbuild/SOURCES
export VERSION=$(sed -n '0,/^.*<version>\(.*\)<\/version>.*$/s//\1/p' pom.xml)
echo "%version ${VERSION}" >> "${HOME}/.rpmmacros"
echo "%buildno ${TRAVIS_BUILD_NUMBER}" >> "${HOME}/.rpmmacros"
echo "%commit ${TRAVIS_COMMIT}" >> "${HOME}/.rpmmacros"
rpmbuild -ba paella-opencast.spec



if [ ! -z "${TRAVIS_TAG}" ]; then
  mkdir ~/deploy
  cp ~/rpmbuild/RPMS/noarch/paella-opencast-${VERSION}-${TRAVIS_BUILD_NUMBER}.${TRAVIS_COMMIT}.noarch.rpm ~/deploy/paella-opencast-${TRAVIS_TAG}.noarch.rpm
  cp target/paella-engage-ui-${VERSION}.jar ~/deploy/paella-engage-ui-${TRAVIS_TAG}.jar
fi
