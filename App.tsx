import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { start } from 'nodejs-mobile-react-native';

export default function App() {
  useEffect(() => {
    start('proxy.js');
  }, []);

  return (
    <WebView source={{ uri: 'file:///android_asset/index.html' }} />
  );
}
