import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { lightColors, darkColors } from '../theme';

export default function FormScreen({ theme }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? darkColors.background : lightColors.background }]}>
                <Text style={[styles.text, { color: theme === 'dark' ? darkColors.text : lightColors.text }]}>
                    Requesting camera permission...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme === 'dark' ? darkColors.background : lightColors.background }]}>
                <Text style={[styles.text, { color: theme === 'dark' ? darkColors.text : lightColors.text }]}>
                    No access to camera
                </Text>
                <TouchableOpacity 
                    style={styles.permissionButton} 
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera} 
                facing={facing}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.flipButton}
                        onPress={() => {
                            setFacing(facing === 'back' ? 'front' : 'back');
                        }}>
                        <Text style={styles.flipText}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 20,
    },
    flipButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 15,
        borderRadius: 10,
    },
    flipText: {
        fontSize: 18,
        color: 'white',
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        marginHorizontal: 20,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});