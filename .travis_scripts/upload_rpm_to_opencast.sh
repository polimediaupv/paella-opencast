#!/bin/sh

export VERSION=$(sed -n '0,/^.*<version>\(.*\)<\/version>.*$/s//\1/p' pom.xml)
curl -i -u "${PKGUPLOADUSER}:${PKGUPLOADPASS}" \
     -F file=@${HOME}/rpmbuild/RPMS/noarch/paella-opencast-${VERSION}-${TRAVIS_BUILD_NUMBER}.${TRAVIS_COMMIT}.noarch.rpm \
     https://pkg.opencast.org/upload