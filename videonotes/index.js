import { registerRootComponent } from 'expo';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import process from 'process';

global.Buffer = Buffer;
global.process = process;
global.crypto = require('crypto');
global.stream = require('stream');
global.util = require('util');
global.assert = require('assert');
global.events = require('events');

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
