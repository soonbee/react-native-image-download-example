import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, Image} from 'react-native';
import {createServer} from './mock';

if (window.server) {
  window.server.shutdown();
}
window.server = createServer();

const App = () => {
  const [imageData, setImageData] = useState();
  const [imageExt, setImageExt] = useState();

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
