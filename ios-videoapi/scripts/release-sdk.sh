#!/bin/bash

set -e -u

THIS_DIR=$(cd -P "$(dirname "$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)
PROJECT_REPO=$(realpath ${THIS_DIR}/../..)
RELEASE_REPO=$(realpath ${THIS_DIR}/../../../../ios-sdk-release)
DEFAULT_SDK_VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" ${THIS_DIR}/../sdk/src/Info.plist)
SDK_VERSION=${OVERRIDE_SDK_VERSION:-${DEFAULT_SDK_VERSION}}
DO_GIT_TAG=${GIT_TAG:-0}


echo "Releasing VideoAPI SDK ${SDK_VERSION}"

pushd ${RELEASE_REPO}

# Generate podspec file
cat VideoAPISDK.podspec.tpl | sed -e s/VERSION/${SDK_VERSION}/g > VideoAPISDK.podspec

# Cleanup
rm -rf Frameworks/*

popd

# Build the SDK
pushd ${PROJECT_REPO}
rm -rf ios-videoapi/sdk/out
xcodebuild clean \
    -workspace ios-videoapi/VideoAPI.xcworkspace \
    -scheme VideoAPISDK
xcodebuild archive \
    -workspace ios-videoapi/VideoAPI.xcworkspace \
    -scheme VideoAPISDK  \
    -configuration Release \
    -sdk iphonesimulator \
    -destination='generic/platform=iOS Simulator' \
    -archivePath ios-videoapi/sdk/out/ios-simulator \
    VALID_ARCHS=x86_64 \
    ENABLE_BITCODE=NO \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES
xcodebuild archive \
    -workspace ios-videoapi/VideoAPI.xcworkspace \
    -scheme VideoAPISDK  \
    -configuration Release \
    -sdk iphoneos \
    -destination='generic/platform=iOS' \
    -archivePath ios-videoapi/sdk/out/ios-device \
    VALID_ARCHS=arm64 \
    ENABLE_BITCODE=NO \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES
xcodebuild -create-xcframework \
    -framework ios-videoapi/sdk/out/ios-device.xcarchive/Products/Library/Frameworks/VideoAPISDK.framework \
    -framework ios-videoapi/sdk/out/ios-simulator.xcarchive/Products/Library/Frameworks/VideoAPISDK.framework \
    -output ios-videoapi/sdk/out/VideoAPISDK.xcframework
if [[ $DO_GIT_TAG == 1 ]]; then
    git tag ios-sdk-${SDK_VERSION}
fi
popd

pushd ${RELEASE_REPO}

# Put the new files in the repo
cp -a ${PROJECT_REPO}/ios-videoapi/sdk/out/VideoAPISDK.xcframework Frameworks/
cp -a ${PROJECT_REPO}/node_modules/react-native-webrtc/apple/WebRTC.xcframework Frameworks/

# Add all files to git
if [[ $DO_GIT_TAG == 1 ]]; then
    git add -A .
    git commit -m "${SDK_VERSION}"
    git tag ${SDK_VERSION}
fi

popd

echo "Finished! Don't forget to push the tags and releases repo artifacts."
echo "The new pod can be pushed to CocoaPods by doing: pod trunk push VideoAPISDK.podspec"
