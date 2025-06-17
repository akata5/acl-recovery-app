import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export async function initializeTF() {
  // Wait for tfjs-react-native to be ready
  await tf.ready();
  // Optionally, set the backend (default is 'rn-webgl')
  // await tf.setBackend('rn-webgl');
  return tf;
}

// Export tf and bundleResourceIO for use in other files
export { tf, bundleResourceIO }; 