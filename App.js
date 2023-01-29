import React, {useEffect, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  Button,
  Image,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import {createServer} from './mock';

if (window.server) {
  window.server.shutdown();
}
window.server = createServer();

const type = 'photo';
const album = 'ImageDownloadExample';

function generateCurrentTimestamp() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hour = now.getHours();
  const min = now.getMinutes();
  const sec = now.getSeconds();
  return `${year}${month}${day}_${hour}${min}${sec}`;
}

const App = () => {
  const [imageData, setImageData] = useState();
  const [imageExt, setImageExt] = useState();
  const [loading, setLoading] = useState(false);

  const checkPermission = async permission => {
    const result = await check(permission);
    switch (result) {
      case RESULTS.DENIED:
        await request(permission);
        await checkPermission(permission);
        break;
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        break;
      case RESULTS.BLOCKED:
        throw Error('Please allow permissions in Settings > Privacy > Photos');
      case RESULTS.UNAVAILABLE:
        throw Error('This feature is not available.');
    }
  };

  const onPressDownload = async () => {
    try {
      if (Platform.OS === 'ios') {
        await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        await checkPermission(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }
    } catch (e) {
      Alert.alert('Notice', e.message, [{text: 'OK'}]);
      return;
    }

    const fileName = `img_${generateCurrentTimestamp()}.${imageExt}`;
    const tmpDir = RNFS.TemporaryDirectoryPath;
    const path = (tmpDir + `/${fileName}`).replace('//', '/');
    setLoading(true);
    try {
      await RNFS.writeFile(path, imageData, 'base64');
      await CameraRoll.save(path, {type, album});
      Alert.alert('Notice', 'Donwload Complete.', [{text: 'OK'}]);
    } catch (e) {
      Alert.alert('Notice', 'Download Failed.', [{text: 'OK'}]);
    } finally {
      if (RNFS.exists(path)) {
        await RNFS.unlink(path);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/image')
      .then(res => res.json())
      .then(json => {
        const {ext, data} = json;
        setImageData(data);
        setImageExt(ext);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Image Download Example</Text>
      <Image
        source={{uri: `data:image/${imageExt};base64,${imageData}`}}
        style={styles.preview}
      />
      <Button title="Download" onPress={onPressDownload} disabled={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
  },
  preview: {
    width: 200,
    height: 200,
    margin: 12,
    borderRadius: 12,
    backgroundColor: 'lightgray',
  },
});

export default App;
